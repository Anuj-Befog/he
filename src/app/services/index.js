export async function addData(formData) {
    try {
        const response = await fetch(`/api/admin/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error adding data: ${errorData.message || 'Unknown error'}`);
            return { success: false, message: errorData.message || 'Unknown error' };
        }

        const result = await response.json();
        return result;
    } catch (e) {
        console.error(`Error in addData: ${e.message}`);
        return { success: false, message: e.message };
    }
}

export async function getData() {
    try {
        const response = await fetch(`/api/admin/get`, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Error getting data: ${errorData.message || 'Unknown error'}`);
            return { success: false, message: errorData.message || 'Unknown error' };
        }

        const result = await response.json();
        return result;
    } catch (e) {
        console.error(`Error in getData: ${e.message}`);
        return { success: false, message: e.message };
    }
}


