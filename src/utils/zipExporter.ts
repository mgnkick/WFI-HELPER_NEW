import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Добавляем все файлы проекта в соответствующие папки
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Добавим README.md с пошаговой инструкцией
  zip.file(
    'README.md',
    `# Wi-Fi Эксперт (Android Kotlin)

Готовое production-ready Android-приложение для глубокой диагностики Wi-Fi, радиоэфира (2.4/5/6 ГГц), интеграции с Яндекс Интернетометром и детекции VPN.

## 🚀 Вариант 1: Сборка через GitHub Actions (без Android Studio!)
1. Создайте новый репозиторий на github.com (Private или Public).
2. Распакуйте этот архив и загрузите все файлы в репозиторий:
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ВАШ_ЛОГИН/wifi-expert-app.git
   git push -u origin main
   \`\`\`
3. Перейдите во вкладку **Actions** в репозитории на GitHub.
4. Выберите workflow **"Build Wi-Fi Expert APK"** и нажмите **"Run workflow"** (или сборка запустится автоматически при пуше).
5. Через 2-3 минуты в блоке **Artifacts** появится файл \`wifi-expert-speedtest-debug-apk.zip\`. Скачайте и установите \`app-debug.apk\` на телефон!

## 💻 Вариант 2: Локальная сборка через скрипт в 1 клик
- Для Linux / macOS: запустите \`chmod +x build_standalone.sh && ./build_standalone.sh\`
- Для Windows: откройте PowerShell в папке проекта и запустите \`powershell -ExecutionPolicy Bypass -File .\\build_standalone.ps1\`
Готовый файл \`wifi-expert-debug.apk\` появится прямо в корне папки!

## 🛠 Вариант 3: Открытие в Android Studio
1. Запустите Android Studio (Hedgehog, Iguana или Ladybug+).
2. Выберите **File -> Open...** и укажите эту папку.
3. Дождитесь завершения Gradle Sync.
4. Нажмите зеленую кнопку **Run (Shift+F10)** или **Build -> Build APK(s)**.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
