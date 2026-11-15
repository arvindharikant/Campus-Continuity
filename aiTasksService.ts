const API_URL = "http://127.0.0.1:8001";

export interface TaskItem {
  task: string;
  responsible_person: string;
  evidence: string;
}

export interface PendingTask {
  task: string;
  responsible_person: string;
  deadline: string;
  evidence: string;
}

export interface DecisionItem {
  decision: string;
  reason: string;
  evidence: string;
}

export interface TasksDecisionsResult {
  completed_tasks: TaskItem[];
  pending_tasks: PendingTask[];
  important_decisions: DecisionItem[];
}

export async function extractTasksAndDecisions(
  documentText: string
): Promise<TasksDecisionsResult> {
  const response = await fetch(
    `${API_URL}/extract-tasks-decisions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_text: documentText,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI extraction failed: ${error}`);
  }

  const result = await response.json();

  return result.data;
}