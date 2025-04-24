// Import testing-library utilities
import '@testing-library/jest-dom';

// Mock next/navigation since we can't use it in tests
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock firebase
jest.mock('@/lib/firebase', () => {
  return {
    auth: {
      onAuthStateChanged: jest.fn(),
      signInWithEmailAndPassword: jest.fn(),
      signOut: jest.fn(),
    },
    db: {
      collection: jest.fn(),
      doc: jest.fn(),
    },
  };
});
