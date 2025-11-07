import * as dotenv from "dotenv";
dotenv.config();

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";

admin.initializeApp();

const BUG_COLLECTION = "bug_reports";

// Secrets (for production)
const JIRA_DOMAIN = defineSecret("JIRA_DOMAIN");
const JIRA_EMAIL = defineSecret("JIRA_EMAIL");
const JIRA_TOKEN = defineSecret("JIRA_TOKEN");
const JIRA_PROJECT_KEY = defineSecret("JIRA_PROJECT_KEY");

export const onBugReportCreated = onDocumentCreated(
    `${BUG_COLLECTION}/{docId}`,
    async (event) => {
        const snap = event.data;
        if (!snap) {
            console.error("onBugReportCreated: no document data");
            return;
        }

        const bug = snap.data();
        const docId = event.params.docId;

        // Local .env fallback
        const jiraUrl =
            process.env.JIRA_DOMAIN || (await JIRA_DOMAIN.value());
        const jiraEmail =
            process.env.JIRA_EMAIL || (await JIRA_EMAIL.value());
        const jiraToken =
            process.env.JIRA_TOKEN || (await JIRA_TOKEN.value());
        const projectKey =
            process.env.JIRA_PROJECT_KEY || (await JIRA_PROJECT_KEY.value());

        if (!jiraUrl || !jiraEmail || !jiraToken || !projectKey) {
            console.error("Missing Jira configuration");
            return;
        }

        // Format Jira description using Atlassian Document Format (ADF)
        const descriptionADF = {
            type: "doc",
            version: 1,
            content: [
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: `Description: ${bug.description || ""}` },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: `Page URL: ${bug.pageUrl || "N/A"}` },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: `Severity: ${bug.severity || "N/A"}` },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: `User ID: ${bug.userId || "N/A"}` },
                    ],
                },
                {
                    type: "paragraph",
                    content: [
                        { type: "text", text: `User Email: ${bug.userEmail || "N/A"}` },
                    ],
                },
            ],
        };

        const issueData = {
            fields: {
                project: { key: projectKey },
                summary: `Bug: ${bug.name || "Anonymous"} reported an issue`,
                description: descriptionADF,
                issuetype: { name: "Bug" },
                labels: ["reported-bug"],
            },
        };

        try {
            const response = await axios.post(
                `${jiraUrl}/rest/api/3/issue`,
                issueData,
                {
                    auth: { username: jiraEmail, password: jiraToken },
                    headers: { "Content-Type": "application/json" },
                }
            );

            const jiraKey = response.data.key;
            console.log(`Created Jira issue ${jiraKey} for bug report ${docId}`);
            await admin.firestore().collection(BUG_COLLECTION).doc(docId).update({
                jiraKey,
                jiraStatus: "OPEN",
                jiraCreatedAt: FieldValue.serverTimestamp(),
            });

        } catch (err: any) {
            console.error(
                "Failed to create Jira issue:",
                err.response?.data || err.message
            );
        }
    }
);

// Jira webhook for automatic cleanup when issue is closed
export const jiraWebhook = onRequest(async (req, res) => {
    try {
        const event = req.body;
        if (!event || !event.issue) {
            res.status(400).send("Invalid webhook payload");
            return;
        }

        const issueKey = event.issue.key;
        const status = event.issue.fields?.status?.name;
        const labels = event.issue.fields?.labels || [];

        console.log(
            `Webhook received: issueKey=${issueKey}, status=${status}, labels=${labels.join(",")}`
        );

        if (labels.includes("reported-bug") && status?.toLowerCase() === "done") {
            const snapshot = await admin
                .firestore()
                .collection(BUG_COLLECTION)
                .where("jiraKey", "==", issueKey)
                .get();

            for (const doc of snapshot.docs) {
                await doc.ref.delete();
                console.log(`Deleted Firestore bug report for Jira issue ${issueKey}`);
            }
        }

        res.status(200).send("OK");
    } catch (err: any) {
        console.error("Error in Jira webhook handler:", err.message);
        res.status(500).send("Internal Server Error");
    }
});
