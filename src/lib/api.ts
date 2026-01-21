export interface WorkflowCreate {
    name: string;
    description?: string;
    workflow_json: Record<string, any>;
}

export const createWorkflow = async (data: WorkflowCreate) => {
    try {
        const response = await fetch('/api/v1/workflows/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to create workflow');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
