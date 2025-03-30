
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
    // Affichages de débogage détaillés
    console.log('Envoie de la requête');
    console.log('Type de learningPlan:', typeof plan);
    
    // Préparons le corps de la requête avec des logs - envoyons directement l'objet sans l'envelopper
    const requestBody = JSON.stringify({plan: plan});
    console.log('Corps de la requête:', requestBody);
    
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/generate_content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestBody
        });
        
        console.log('Statut de la réponse:', response.status);
        
        // On récupère d'abord le texte brut pour voir s'il y a un problème
        const rawText = await response.text();
        console.log('Réponse brute:', rawText);
        
        // Puis on essaie de le parser en JSON si possible
        let data;
        try {
            data = JSON.parse(rawText);
            console.log('Réponse JSON parsée:', data);
        } catch (parseError) {
            console.error('Impossible de parser la réponse en JSON:', parseError);
            // On retourne quand même le texte brut
            return rawText;
        }
        
        return data;
    } catch (error) {
        console.error('Erreur lors de l\'appel de l\'API:', error);
        throw error;
    }
}

async function chatWithAI(context : string, message: string): Promise<any> {
    try {
        const response = await fetch('https://hook.eu1.make.com/mo2jx6wnssgv9nu4r3wqxx9t2molek13', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context, message })
        });

        // Vérification du statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP : statut ${response.status}`);
        }

        // Conversion de la réponse en JSON et retour
        const jsonResponse = await response.json();
        const data = jsonResponse.reponse;
        console.log('Réponse du webhook:', data);
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

<<<<<<< HEAD
export { sendCreateCourse, chatWithAI, generatePlanningTree, generateOnboarding };
||||||| 96d51c0
export { sendCreateCourse, chatWithAI, generatePlanningTree, generateOnboarding };
=======
async function generateFeedback(plan:LearningPlan, user_message: string, conversation_history:string): Promise<any> {
    try {
        const response = await fetch('https://curious-tree-journey.onrender.com/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan, user_message, conversation_history })
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

export { sendCreateCourse, chatWithAI, generatePlanningTree, generateOnboarding };
>>>>>>> refs/remotes/origin/main
