import { Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-8">
          <Shield className="h-24 w-24 text-hyperion-primary" />
        </div>
        
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-hyperion-primary to-hyperion-secondary bg-clip-text text-transparent">
          Project Hyperion
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          AI-Powered Parametric Insurance Protocol on Cardano
        </p>
        
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-hyperion-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            Connect Wallet
          </button>
          <button className="px-6 py-3 border border-hyperion-primary text-hyperion-primary rounded-lg hover:bg-hyperion-primary hover:text-white transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  )
}
