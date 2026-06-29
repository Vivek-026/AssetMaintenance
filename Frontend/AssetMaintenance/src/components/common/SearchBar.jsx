function SearchBar({ value, onChange, onSearch, onClear, placeholder = 'Search...' }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch()
        }
    }

    return (
        <div className="flex gap-2 mb-6">
            <div className="flex-1">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            <button
                onClick={onSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
                Search
            </button>
            {value && (
                <button
                    onClick={onClear}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                    Clear
                </button>
            )}
        </div>
    )
}

export default SearchBar

