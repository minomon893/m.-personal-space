export default function MonsterDisplay({ monsterKey, isShaking, aiResponse }) {
  const images = {
    witch: "/images/monsters/witch.png",
    dragon: "/images/monsters/dragon.png",
    slime: "/images/monsters/slime.png",
    blackhall: "/images/monsters/blackhall.png",
    golem: "/images/monsters/golem.png",
  };

  return (
    <div className={`relative h-64 flex flex-col items-center justify-center border-2 border-purple-900 mb-8 bg-purple-950/10 transition-all ${isShaking ? 'shake border-red-500' : ''}`}>
      <img 
        src={images[monsterKey]} 
        alt="Monster" 
        className="h-48 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
      />
      
      {aiResponse && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
          <p className="text-purple-300 italic text-sm px-4 text-center">"{aiResponse.monsterReaction}"</p>
          <p className="text-4xl font-black text-red-500 animate-bounce mt-2">DAMAGE: {aiResponse.damage}</p>
        </div>
      )}
    </div>
  );
}