import React, { useState } from 'react';
import {
  Code,
  Download,
  Copy,
  Check,
  FolderTree,
  FileCode,
  Terminal,
  Cloud,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { generateAndroidProjectZip, triggerDownload } from '../utils/zipExporter';

export const AndroidCodeHubView: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState(5); // WifiMetricsManager.kt by default
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [guideTab, setGuideTab] = useState<'github' | 'scripts' | 'studio' | 'permissions'>('github');

  const activeFile = ANDROID_PROJECT_FILES[activeFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateAndroidProjectZip();
      triggerDownload(blob, 'wifi-expert-android-project.zip');
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. БАННЕР СКАЧИВАНИЯ ГОТОВОГО ПРОЕКТА */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Production-Ready Android Kotlin проект
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              Исходный код приложения с автосборкой .APK
            </h3>

            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Готовый полный проект для Android 10–14+ (Kotlin, Jetpack Compose, Material3, Coroutines, WifiManager, NetworkCapabilities, детекция VPN, Яндекс Интернетометр). Вы можете скачать весь архив в один клик и сразу собрать готовый установочный файл .APK!
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isZipping ? 'Упаковка ZIP...' : 'Скачать готовый Android-проект (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ПОШАГОВОЕ РУКОВОДСТВО: КАК СОБРАТЬ 1 APK ФАЙЛ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h4 className="text-base font-bold text-white">
            Инструкция: как получить готовый файл .APK для установки на телефон
          </h4>
        </div>

        {/* Вкладки руководства */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setGuideTab('github')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              guideTab === 'github'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Вариант А: GitHub Actions (В облаке без Android Studio!)</span>
          </button>

          <button
            onClick={() => setGuideTab('scripts')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              guideTab === 'scripts'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Вариант Б: Скрипт в 1 клик (Linux / Mac / Windows)</span>
          </button>

          <button
            onClick={() => setGuideTab('studio')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              guideTab === 'studio'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Вариант В: Android Studio / Терминал (assembleDebug)</span>
          </button>

          <button
            onClick={() => setGuideTab('permissions')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              guideTab === 'permissions'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Разрешения Android 10-14+ (GPS и Wi-Fi)</span>
          </button>
        </div>

        {/* СОДЕРЖИМОЕ ВКЛАДКИ РУКОВОДСТВА */}
        <div className="text-xs text-slate-300 space-y-4">
          {guideTab === 'github' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cloud className="w-4 h-4" />
                <span>Самый быстрый способ: сборка на бесплатных серверах GitHub Actions</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Вам <strong>не нужно устанавливать тяжелую Android Studio (более 10 Гб)</strong>. Облачные серверы GitHub скомпилируют всё за 2 минуты:
              </p>
              <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                <li>
                  <strong>Скачайте проект:</strong> Нажмите кнопку выше <em>«Скачать готовый Android-проект (.ZIP)»</em> и распакуйте архив на компьютере.
                </li>
                <li>
                  <strong>Загрузите в новый репозиторий на GitHub:</strong>
                  <pre className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-cyan-300 mt-1 select-all">
{`git init
git add .
git commit -m "Initial commit for Wi-Fi Expert APK"
git branch -M main
git remote add origin https://github.com/ВАШ_АККАУНТ/wifi-expert-app.git
git push -u origin main`}
                  </pre>
                </li>
                <li>
                  <strong>Автоматическая компиляция:</strong> В репозитории на GitHub перейдите во вкладку <strong>Actions</strong>. В файле <code>.github/workflows/build_apk.yml</code> уже всё настроено: запустится сборка <code>./gradlew assembleDebug</code> на Ubuntu с Java 17.
                </li>
                <li>
                  <strong>Скачивание готового .APK:</strong> Когда появится зеленая галочка ✅ (через 2-3 мин), кликните по сборке, прокрутите вниз до раздела <strong>Artifacts</strong> и скачайте архив <code>wifi-expert-debug-apk.zip</code>. Внутри лежит готовый файл <strong>app-debug.apk</strong>, который можно сразу скинуть на телефон через Telegram/USB и установить!
                </li>
              </ol>
            </div>
          )}

          {guideTab === 'scripts' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Play className="w-4 h-4" />
                <span>Локальная сборка в один клик через готовые скрипты</span>
              </div>
              <p className="leading-relaxed">
                В скачанном архиве уже лежат скрипты автоматической сборки:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">Для Windows (PowerShell):</span>
                  <p className="text-slate-400 mb-2">Откройте папку проекта в PowerShell и запустите:</p>
                  <pre className="bg-slate-950 p-2 rounded font-mono text-[11px] text-emerald-400 select-all">
powershell -ExecutionPolicy Bypass -File .\build_standalone.ps1
                  </pre>
                  <p className="text-slate-400 mt-2 text-[10px]">
                    Скрипт скомпилирует проект и скопирует <strong>wifi-expert-debug.apk</strong> прямо в корень папки!
                  </p>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">Для Linux / macOS (Bash):</span>
                  <p className="text-slate-400 mb-2">Откройте терминал в папке проекта и выполните:</p>
                  <pre className="bg-slate-950 p-2 rounded font-mono text-[11px] text-emerald-400 select-all">
chmod +x build_standalone.sh && ./build_standalone.sh
                  </pre>
                  <p className="text-slate-400 mt-2 text-[10px]">
                    Требуется только установленная Java 17 (OpenJDK).
                  </p>
                </div>
              </div>
            </div>
          )}

          {guideTab === 'studio' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Cpu className="w-4 h-4" />
                <span>Сборка через Android Studio или командную строку Gradle</span>
              </div>
              <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                <li>
                  Откройте Android Studio, выберите <strong>File -&gt; Open...</strong> и укажите папку распакованного проекта.
                </li>
                <li>
                  Дождитесь завершения автоматической синхронизации Gradle (Gradle Sync).
                </li>
                <li>
                  <strong>Сборка Debug APK через меню:</strong> <em>Build -&gt; Build Bundle(s) / APK(s) -&gt; Build APK(s)</em>.
                </li>
                <li>
                  <strong>Или через терминал:</strong>
                  <pre className="bg-slate-900 p-2 rounded font-mono text-[11px] text-cyan-300 my-1 select-all">
./gradlew assembleDebug
                  </pre>
                  Готовый файл .APK появится по пути:
                  <code className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded ml-1 font-mono">
                    app/build/outputs/apk/debug/app-debug.apk
                  </code>
                </li>
                <li>
                  <strong>Сборка подписанного Release APK:</strong>
                  <pre className="bg-slate-900 p-2 rounded font-mono text-[11px] text-cyan-300 my-1 select-all">
keytool -genkey -v -keystore release.keystore -alias wifiexpert -keyalg RSA -keysize 2048 -validity 10000
./gradlew assembleRelease
                  </pre>
                </li>
              </ol>
            </div>
          )}

          {guideTab === 'permissions' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Особенности разрешений Android 10-14+: почему нужен включенный GPS</span>
              </div>
              <p className="leading-relaxed">
                Многие пользователи удивляются: <em>«Зачем Wi-Fi анализатору доступ к геолокации и включенный GPS?»</em>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-slate-300">
                <li>
                  <strong>Требование безопасности Google:</strong> По уникальным MAC-адресам (BSSID) окружающих Wi-Fi точек можно с точностью до 3 метров вычислить местоположение смартфона. Поэтому начиная с Android 10, система Google запрещает приложениям читать BSSID и SSID без разрешения <code>ACCESS_FINE_LOCATION</code>.
                </li>
                <li>
                  <strong>Обязательно включите тумблер «Геолокация» в шторке:</strong> Если тумблер GPS отключен, метод <code>wifiInfo.ssid</code> возвратит системную заглушку <code>&lt;unknown ssid&gt;</code>, а список сканирования будет пустым.
                </li>
                <li>
                  <strong>Wi-Fi Throttling (Ограничение частоты сканирования):</strong> В настройках разработчика Android включена опция «Ограничение сканирования Wi-Fi» (не чаще 4 раз за 2 минуты в фоне). Наш сервис автоматически обрабатывает этот лимит.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 3. БРАУЗЕР ИСХОДНОГО КОДА ПРОЕКТА */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <h4 className="text-base font-bold text-white">
              Структура и файлы исходного кода
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile ? 'Скопировано!' : 'Копировать код файла'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Список файлов (Дерево) */}
          <div className="lg:col-span-4 bg-slate-950 rounded-2xl p-2 border border-slate-800 space-y-1 max-h-[500px] overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5 block">
              Файлы проекта:
            </span>
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-colors flex items-center justify-between gap-2 ${
                  activeFileIndex === idx
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 flex-shrink-0">
                  {file.category}
                </span>
              </button>
            ))}
          </div>

          {/* Просмотрщик кода выбранного файла */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300">
                  {activeFile.path}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeFile.description}
                </span>
              </div>

              <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed p-2 select-all">
                {activeFile.content}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
