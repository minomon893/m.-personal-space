// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        {/* children をレンダリングする必要があります */}
        {children}
      </body>
    </html>
  )
}