import Link from 'next/link';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <div>
        <Link href="/play">
          <button>Play</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;