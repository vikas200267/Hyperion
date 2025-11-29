# Hyperion AI Swarm

FastAPI backend with CrewAI agents for risk assessment and claim processing.

## Tech Stack

- **Framework**: FastAPI
- **AI Orchestration**: CrewAI
- **LLM**: Google Gemini (google-generativeai)

## Getting Started

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn api.main:app --reload
```

API will be available at [http://localhost:8000](http://localhost:8000).

## Structure

```
swarm/
├── agents/       # CrewAI agent definitions
├── api/          # FastAPI routes
├── core/         # Core business logic
└── requirements.txt
```

## Agents

- **Risk Assessor**: Evaluates insurance policy risks
- **Weather Analyst**: Processes weather data for parametric triggers
- **Claims Processor**: Automates claim validation and processing
