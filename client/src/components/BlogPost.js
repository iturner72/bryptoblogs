import Link from 'next/link';

export default function BlogPost({ title, published_at, link, summary, company, logoUrl }) {
  return (
    <Link href={link} rel="noopener noreferrer" target="_blank"
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl m-1 border border-gray-200 hover:border-emerald-500 transition"
    >
      <div className="md:flex">
        <div className="p-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={logoUrl} alt={''} className="h-8 w-8 object-contain" />
              <div className="tracking-wide text-md text-emerald-500 font-semibold">{company}</div>
            </div>
            <div className="uppercase tracking-wide text-sm">{published_at}</div>
          </div>
          <div className="block mt-1 text-lg leading-tight font-medium">
            {title}
          </div>
          <p className="mt-2 text-gray-500">
            {/* Manually append a period if it doesn't exist and there isn't other punctuation */}
            {summary + (".!?".includes(summary.slice(-1)) ? "" : ".")}
          </p>
        </div>
      </div>
    </Link>
  )
}
