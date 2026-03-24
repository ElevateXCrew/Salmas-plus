import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

async function generateDummyVideo() {
  const outputPath = path.join(process.cwd(), 'public', 'videos', 'about-video.mp4')
  
  // Using FFmpeg to create a 10-second dummy video with gradient background
  const ffmpegCommand = `ffmpeg -f lavfi -i color=c=0xFF1493:s=1080x1080:d=10 -f lavfi -i "sine=frequency=1000:duration=10" -vf "drawtext=text='Premium Content':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -t 10 -pix_fmt yuv420p -c:a aac "${outputPath}" -y`

  try {
    console.log('Generating dummy video...')
    await execAsync(ffmpegCommand)
    console.log('✓ Dummy video generated successfully at:', outputPath)
  } catch (error: any) {
    console.error('FFmpeg not found. Creating placeholder HTML5 video instead...')
    console.log('\nPlease use one of these free dummy videos:')
    console.log('1. https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
    console.log('2. https://www.w3schools.com/html/mov_bbb.mp4')
    console.log('3. https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4')
  }
}

generateDummyVideo()
