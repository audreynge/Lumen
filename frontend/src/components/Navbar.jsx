import Link from 'next/link';
import { FaPhone } from "react-icons/fa6";

const Navbar = () => {
  return (
    <nav className="bg-[#CC0000] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-10 items-center">
            <Link href="/" className="font-roboto text-xl font-bold">Lumen</Link>
            <a href="tel:911" className="flex items-center gap-2 font-roboto text-lg text-red-500 hover:text-red-700 bg-white py-2 px-4 rounded-md font-medium"><span><FaPhone /></span>911</a>
          </div>
          <div className="flex space-x-10">
            <a href="#issues" className="font-roboto hover:text-gray-200">Issues</a>
            <a href="#map" className="font-roboto hover:text-gray-200">Map</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;