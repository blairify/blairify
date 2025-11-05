# Mistral AI Model Configuration

This document explains the different Mistral AI models used in the interview system and how to configure them.

## Model Selection Strategy

The system automatically selects the most appropriate model based on the use case:

### Interview Models (Lightweight & Fast)
- **Default**: `ministral-8b-latest` - Powerful edge model with excellent performance/price ratio
- **Alternative**: `mistral-small-latest` - Efficient small model for general interviews
- **Coding**: `codestral-latest` - Specialized for coding interviews

### Analysis Models (Powerful & Detailed)
- **Default**: `mistral-medium-latest` - Frontier-class model for complex analysis
- **Alternative**: `mistral-large-latest` - Top-tier model for highest complexity

## Environment Variables

You can override the default model selection by setting these environment variables:

```bash
# Core API Configuration
MISTRAL_API_KEY=your_api_key_here

# Model Overrides (optional)
MISTRAL_INTERVIEW_MODEL=ministral-8b-latest
MISTRAL_ANALYSIS_MODEL=mistral-medium-latest  
MISTRAL_CODING_MODEL=codestral-latest
```

## Available Models

### Lightweight Models (Fast, Cost-Effective)
- `ministral-3b-latest` - World's best edge model (smallest)
- `ministral-8b-latest` - Powerful edge model (recommended for interviews)
- `mistral-small-latest` - Efficient small model

### Powerful Models (High Quality, More Expensive)
- `mistral-medium-latest` - Frontier-class multimodal model (recommended for analysis)
- `mistral-large-latest` - Top-tier model for highest complexity

### Specialized Models
- `codestral-latest` - Optimized for code generation and coding interviews
- `mistral-embed-latest` - For embeddings and semantic search

## Automatic Model Selection

The system automatically chooses models based on:

1. **Interview Type**:
   - `coding` → Uses `codestral-latest`
   - `technical`, `bullet`, `system-design` → Uses `ministral-8b-latest`

2. **Use Case**:
   - Interview questions → Lightweight model for speed
   - Analysis & feedback → Powerful model for quality

3. **Performance Considerations**:
   - Interviews need fast response times
   - Analysis can take longer for better quality

## Cost Optimization

- **Interviews**: Use lightweight models (8B parameters) for fast, cost-effective responses
- **Analysis**: Use powerful models (Medium/Large) for detailed, high-quality analysis
- **Coding**: Use specialized Codestral model for best coding performance

## Model Capabilities

### Ministral 8B (Interview Default)
- ✅ Fast response times
- ✅ Cost-effective
- ✅ Good for conversational interviews
- ✅ Handles technical questions well

### Mistral Medium (Analysis Default)  
- ✅ Deep reasoning capabilities
- ✅ Detailed analysis and feedback
- ✅ Better at complex evaluations
- ✅ Multimodal capabilities

### Codestral (Coding Interviews)
- ✅ Specialized for code generation
- ✅ Understands 80+ programming languages
- ✅ Fill-in-the-middle capabilities
- ✅ Code completion and debugging

## Configuration Examples

### Development (Cost-Optimized)
```bash
MISTRAL_INTERVIEW_MODEL=ministral-8b-latest
MISTRAL_ANALYSIS_MODEL=mistral-medium-latest
MISTRAL_CODING_MODEL=codestral-latest
```

### Production (Quality-Optimized)
```bash
MISTRAL_INTERVIEW_MODEL=mistral-small-latest
MISTRAL_ANALYSIS_MODEL=mistral-large-latest
MISTRAL_CODING_MODEL=codestral-latest
```

### Budget-Conscious
```bash
MISTRAL_INTERVIEW_MODEL=ministral-8b-latest
MISTRAL_ANALYSIS_MODEL=mistral-medium-latest
MISTRAL_CODING_MODEL=mistral-small-latest
```

## Monitoring

The system logs which model is being used:
- `🤖 Using model for interview: ministral-8b-latest (type: coding)`
- `🔍 Using model for analysis: mistral-medium-latest`

Check your application logs to verify the correct models are being selected.
