import { useNavigate } from '@remix-run/react'
import { ChevronLeft } from 'lucide-react'
export const BackButton = () => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(-1)
  }
  return (
    <button
      className="border-none bg-transparent flex items-center"
      onClick={handleClick}
      type="button"
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      Back
    </button>
  )
}
