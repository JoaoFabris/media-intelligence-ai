'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Algo deu errado.</p>
            <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
                Tentar novamente
            </button>
        </div>
    )
}