
/**
 * Interface définissant la structure d'un chapitre du cours
 */
interface Chapter {
    id?: string;
    title: string;
    prerequisites?: string[];
    content?: {
        explanation?: string;
        tips?: string;
        resources?: string[];
    };
}

/**
 * Interface définissant la structure d'un plan d'apprentissage
 */
interface LearningPlan {
    title: string;
    description: string;
    chapters: Chapter[];
}

async function generatePlanningTree(subject: string, context: string): Promise<any> {
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/plan', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context, subject })
        });

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        // Conversion de la réponse en JSON et retour
        const data = await response.json();
        console.log('Réponse du webhook:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel du webhook:', error);
        throw error;
    }
}
/**
 * Envoie une requête pour générer du contenu détaillé pour un plan d'apprentissage
 * @param learningPlan - Le plan d'apprentissage pour lequel générer du contenu
 * @returns La réponse de l'API contenant le plan d'apprentissage avec le contenu généré
 */
async function sendCreateCourse(plan: LearningPlan): Promise<any> {
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/generate_content', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Réponse de l API:', data);
        
        // Return the data with chapters for EditConversation
        return {
            title: data.title,
            description: data.description,
            chapters: data.chapters,
            // Keep the tree structure for other components
            rootNode: {
                id: 'root',
                title: data.title,
                description: data.description,
                status: 'active',
                children: []
            },
            nodes: []
        };
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

async function chatWithAI(context : string, message: string): Promise<any> {
    console.log("Contexte:", context);
    console.log("Message:", message);
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/chat', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context, message })
        });
        console.log("Réponse du webhook:", response);
        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        // Conversion de la réponse en JSON et retour
        const jsonResponse = await response.json();
        const data = jsonResponse.response;
        console.log('Réponse de l api:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel du webhook:', error);
        throw error;
    }
}

async function generateOnboarding(subject: string): Promise<any> {
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/context', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ subject })
        });

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        const data = await response.json();
        console.log('Réponse du webhook:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel du webhook:', error);
        throw error;
    }
}

async function generateFeedback(context: string, current_plan:LearningPlan, user_message: string, conversation_history:string): Promise<any> {
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/feedback', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context ,current_plan, user_message, conversation_history })
        });

        console.log("Réponse du webhook:", response);

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        const data = await response.json();
        console.log('Réponse de l API:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel du webhook:', error);
        throw error;
    }
}


export { sendCreateCourse, chatWithAI, generatePlanningTree, generateOnboarding, generateFeedback };
