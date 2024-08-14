import './App.css'

function App() {
  return (
    <>
      <div className='-z-10 fixed bg-gradient-to-r from-sky-500 to-indigo-500 w-full h-full'>Background</div>
      <div className='hidden z-10 fixed lg:flex items-center h-screen left-desktop'>
        <div className='w-80 h-3/6 bg-slate-500'>Text</div>
      </div>
      <section className='lg:ml-mobile'>
        <div className='md:max-w-xl mx-auto lg:mx-0 h-screen bg-white'>
          <h1 className="text-3xl font-bold underline">Contents</h1>
        </div>
      </section>
    </>
  )
}

export default App
