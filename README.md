# 🎬 LoRA AI Video Generator

Generate stylized AI videos from your images using LoRA-powered fine-tuning and natural language prompts.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## 🚀 Getting Started

### Project Dependencies

This project uses [pnpm](https://pnpm.js.org/) as its package manager.

### Installation

To install `pnpm` globally, run the following command:

```bash
npm install -g pnpm
```

### Usage

After installing pnpm, you can install project dependencies using:

```bash
pnpm install
```

### Alternative Package Managers

If you prefer to use `npm` or `yarn` instead of `pnpm`, you can delete the node_modules folder and the package-lock.json file (if it exists), and then run the following command to install the dependencies using your preferred package manager:

```bash
npm install
# or
yarn install
```

Using pnpm is recommended for its fast and disk space-efficient installation of packages.

### Running dev server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## ✨ Features

This app offers a smooth and intuitive experience with the following features:

- Upload an image (drag-and-drop or file picker)

- Add a creative text prompt

- Customize generation settings: model, resolution, aspect ratio, frames, LoRA styles, and advanced parameters

- Uses MagicAPI for AI video generation

- Real-time status updates and progress polling

- Local history panel to replay and download past videos

- Responsive and modern UI with TailwindCSS

---
## 🛠 Tech Stack

- Next.js (App Router)

- TailwindCSS and Shadcn/ui for styling

- TypeScript for code safety & typing

- MagicAPI for AI image & video generation

- LocalStorage for storing history and API key

---

## 📂 Folder Structure

.

├── app/

│ └── page.tsx # Main page with upload & generation logic

├── components/

│ └── HistoryPanel.tsx # Displays previously generated videos with playback

│ └── ImageUploader.tsx # Image upload UI

│ └── GenerationForm.tsx # Form for prompt and settings

├── lib/

│ ├── api.ts # API calls: upload, status, generate video

│ └── utils.ts # Constants, utility functions, classnames helper

---

## 🔌 API Integration

The app uses **MagicAPI** endpoints for the following operations:

### 🖼️ Image Upload

**POST**  
`https://api.magicapi.dev/api/v1/magicapi/image-upload/upload`

### 📊 Status Check

**GET**  
`https://prod.api.market/api/v1/magicapi/wan-text-to-image/image-to-video/status/{uploadId}`

### 🎥 Generate Video

**POST**  
`https://prod.api.market/api/v1/magicapi/wan-text-to-image/image-to-video/run`

> **Note:** All API calls require the header  
> `"x-magicapi-key": your_api_key`

---

## 📝 Usage

1. **Upload an image** (drag & drop or click to select).
2. **Enter a descriptive prompt.**
3. **Choose your configuration:**
   - Model
   - Resolution
   - Aspect Ratio
   - Frames
   - LoRA Style
4. **Adjust advanced options (optional):**
   - Sample Steps
   - Guidance Scale
   - LoRA Model Strength
   - LoRA CLIP Strength
5. **Click "Generate Video"** to start.
6. **Watch progress** in real-time.
7. **View generated videos** in the **history panel**.
   - Replay or download videos anytime.

---

## ⚙️ Configuration Fields

| Field                | Options / Range                         | Default               |
|----------------------|------------------------------------------|------------------------|
| **Model**            | `1.3B`, `14B`                            | `14B`                  |
| **Resolution**       | `480p`, `720p`                           | `480p`                 |
| **Aspect Ratio**     | `auto`, `16:9`, `9:16`, `1:1`            | `16:9`                 |
| **Frames**           | `17`, `33`, `49`, `65`, `81`            | `33`                   |
| **LoRA Style**       | `Wan Flat Color v2`, `360 Effect`, `Aging Effect`, `Baby Style` | `Wan Flat Color v2` |
| **Sample Steps**     | `1` to `60`                              | `30`                   |
| **Guidance Scale**   | `0.0` to `10.0`                          | `5.0`                  |
| **LoRA Model Strength** | `0.0` to `2.0`                       | `1.0`                  |
| **LoRA CLIP Strength**  | `0.0` to `2.0`                       | `1.0`                  |

---

## 🖼 History Panel

- Displays **past generated videos** with relative timestamps (e.g., _"5 mins ago"_)
- **Play / Pause controls** for preview
- **Carousel-based navigation** for scrolling through history
- Data is **persisted in `localStorage`**

---

## Live Demo

You can try out ResumeCraft live here:  
🔗 [https://image-to-video-api-market-app.vercel.app/](https://image-to-video-api-market-app.vercel.app/)
