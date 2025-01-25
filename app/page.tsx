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
      <div>
        <Link href="/signin">
          <button>Sign In</button>
        </Link>
      </div>
      <div>
        <Link href="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;