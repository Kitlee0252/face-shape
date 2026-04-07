import FaceDetector from '@/components/detector/FaceDetector';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Face Shape Detector
          </h1>
          <p className="mt-2 text-gray-500">
            Upload a photo to detect your face shape instantly.
            100% private — everything runs in your browser.
          </p>
        </div>
        <FaceDetector />
      </div>
    </main>
  );
}
