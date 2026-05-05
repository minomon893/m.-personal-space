import "./globals.css";

    // ... (フォントの設定など)

    export const metadata = {
      title: "m. personal space",
      description: "地味で愛しいソロ生活とメタ認知の記録",
      // ... (その他のメタデータ)
      icons: {
        icon: "/m.png", // 通常のファビコン用
        apple: "/m.png", // iPhone用
      },
    };

    export default function RootLayout({ children }) {
      return (
        <html lang="ja">
          
          {children}
        </html>
      );
    }
    ```