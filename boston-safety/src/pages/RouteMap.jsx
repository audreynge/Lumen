const RouteMap = ({ routeData }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
 

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div ref={mapRef} className="w-full h-[400px] mb-4"></div>
      {routeData && <RouteMap routeData={routeData} />}

      <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100 font-roboto"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-4 py-2 bg-[#2196F3] hover:bg-[#1976D2] text-white rounded font-roboto transition-colors"
            type="button"
          >
            Analyze
          </button>
      </div>
    </div>
  );
};

export default RouteMap;