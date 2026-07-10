import NoticeCard from './NoticeCard'

export default function LatestNotices() {
  const notices = [
    {
      id: 1,
      category: 'Catering',
      title: '3 People Needed for Wedding Catering',
      location: 'Coimbatore',
      date: 'May 20, 2024',
      pay: '₹800 / day'
    },
    {
      id: 2,
      category: 'Event',
      title: 'Helpers Needed for College Event',
      location: 'Coimbatore',
      date: 'May 22, 2024',
      pay: '₹500 / day'
    },
    {
      id: 3,
      category: 'Delivery',
      title: 'Delivery Boys Needed for Weekend',
      location: 'Coimbatore',
      date: 'May 23, 2024',
      pay: '₹700 / day'
    },
    {
      id: 4,
      category: 'Cleaning',
      title: 'Home Cleaning Assistant Needed',
      location: 'Coimbatore',
      date: 'May 21, 2024',
      pay: '₹600 / day'
    }
  ]

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Latest Notices</h2>
          <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">View All</a>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </div>
    </section>
  )
}
