const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-roboto text-xl font-bold mb-4">Lumen</h3>
            <p className="font-roboto text-gray-400">Empowering communities through AI-driven urban solutions</p>
          </div>
          <div>
            <h4 className="font-roboto text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#map" className="font-roboto text-gray-400 hover:text-white">Map</a>
              </li>
              <li>
                <a href="#dashboard" className="font-roboto text-gray-400 hover:text-white">Dashboard</a>
              </li>
              <li>
                <a href="#trending" className="font-roboto text-gray-400 hover:text-white">Trending Issues</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-roboto text-lg font-bold mb-4">Contact</h4>
            <p className="font-roboto text-gray-400">
              City Hall Plaza
              <br />
              Boston, MA 02201
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="font-roboto text-gray-400">
            © 2025 Lumen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer;