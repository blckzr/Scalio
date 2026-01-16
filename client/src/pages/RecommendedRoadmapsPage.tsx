import { useState, useEffect } from 'react';
import api from '../lib/api';

const RecommendedRoadmapsPage = () => {
    const [roadmaps, setRoadmaps] = useState<Array<{ template_id: string; title: string; description: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendedRoadmaps = async () => {
            try {
                const response = await api.get('/users/recommended-roadmaps');
                setRoadmaps(response.data.recommendedRoadmaps);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedRoadmaps();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Recommended Roadmaps</h1>
            {roadmaps.length > 0 ? (
                <ul>
                    {roadmaps.map((roadmap) => (
                        <li key={roadmap.template_id}>
                            <h2>{roadmap.title}</h2>
                            <p>{roadmap.description}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recommended roadmaps found.</p>
            )}
        </div>
    );
};

export default RecommendedRoadmapsPage;
