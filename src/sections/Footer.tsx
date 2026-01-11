'use client'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-white">
      <div className="mx-auto w-[80%] px-6 py-14">
        <div className="flex flex-col items-center text-center">
          <img src="(～￣▽￣)～.svg" alt="" />
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#252525] sm:text-4xl">
            ДО СКОРОГО!
          </h2>
        </div>

        <div className="mt-10 grid gap-4 text-center text-sm text-neutral-500 sm:grid-cols-3">
          <div>ОГРНИП 324619600163400</div>
          <div>© Дизайн HOPE, 2025</div>
          <div>ИНН 616209647428</div>
        </div>
      </div>
    </footer>
  )
}
