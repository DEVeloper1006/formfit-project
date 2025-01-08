import Head from 'next/head';
import VideoRecorder from '../components/VideoRecorder';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Video Recorder</title>
        <meta name="description" content="Camera video recording interface using Next.js" />
      </Head>
      <main style={{ padding: '20px' }}>
        <h1>Next.js Video Recorder</h1>
        <VideoRecorder />
      </main>
    </div>
  );
}
