
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { ArrowRight, LayoutPanelLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        <div className="max-w-4xl mx-auto px-6 pt-16 text-center pb-24">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">Recommended Roadmaps</h1>
            {roadmaps.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roadmaps.map((roadmap) => (
                        <div
                            key={roadmap.template_id}
                            className="relative bg-[#1a1a1a] p-8 rounded-3xl border border-gray-800 text-left hover:border-gray-500 hover:bg-[#222] transition-all group overflow-hidden block"
                        >
                            {/* Decorative Corner Accent */}
                            <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-3xl bg-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />

                            {/* Icon Box */}
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                                <LayoutPanelLeft className="text-white" size={24} />
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                                {roadmap.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                {roadmap.description}
                            </p>
                            <Link
                                to={`/roadmap/${roadmap.template_id}`}
                                className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium group-hover:text-white transition-colors"
                            >
                                Begin Journey <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No recommended roadmaps found.</p>
            )}
        </div>
    );
};

export default RecommendedRoadmapsPage;
