function ActiveIssues({ mbtaLines, issues }){
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="font-roboto text-3xl font-bold mb-8">
        MBTA Line Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mbtaLines.map((line) => {
          const lineIssues = issues.filter((i) => i.mbta_line === line);
          return (
            <div key={line} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-roboto text-xl font-bold mb-4">{line}</h3>
              <div className="text-3xl font-bold text-[#CC0000]">
                {lineIssues.length}
              </div>
              <div className="font-roboto text-gray-600">Active Issues</div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default ActiveIssues;