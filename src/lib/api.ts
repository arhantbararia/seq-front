export interface PluginSelection {
    name: string;
    plugin_provider_id: string;
    capability_key: string;
    config: Record<string, any>;
}

export interface WorkflowCreate {
    name: string;
    description?: string;
    is_enabled?: boolean;
    is_public?: boolean;
    trigger: PluginSelection;
    action: PluginSelection;
}

export interface WorkflowSubscribe {
    workflow_id: string;
    trigger_config?: Record<string, any>;
    action_config?: Record<string, any>;
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
