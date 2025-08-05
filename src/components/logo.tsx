import Image from 'next/image';
function Logo() {
  return (
    <div className="contents">
      <Image
        src={'/images/FilipiKnow-Logo.png'}
        width={200}
        height={200}
        alt="FilipiKnow Logo"
        className="object-contain size-full"
      />
    </div>
  );
}

export default Logo;
