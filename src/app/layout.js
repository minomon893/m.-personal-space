// app/layout.js
import "./globals.css"; // 必要であれば読み込み

export const metadata = {
  title: "m. personal space",
  description: "地味で愛しいソロ生活",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      {/* 全体の背景色を一貫させるためにbodyに色を指定します */}
      <body style={{ backgroundColor: '#E6E1CF', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}