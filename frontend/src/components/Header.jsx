import Link from 'next/link';

const Header = () => {
  return (
    <nav className="bg-[#CC0000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-roboto text-xl font-bold">
                Lumen
            </Link>
          </div>
          <div className="flex space-x-4">
            <a
              href="#mbta-issues"
              className="font-roboto hover:text-gray-200"
            >
              Issues
            </a>
            <a href="#map" className="font-roboto hover:text-gray-200">
              Map
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header;