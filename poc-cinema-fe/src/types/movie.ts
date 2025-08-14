export interface Movie {
  id: number;
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  duration: number; // in minutes
  releaseDate: string;
  rating: string;
  posterUrl: string;
  description: string;
  trailerUrl?: string;
  review: number;
  language: string;
  price: number;
  isFavourite?: boolean;
}

interface Rating {
  Source: string;
  Value: string;
}

export interface DetailedMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Rating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface Showtime {
  id: number;
  movie: Movie;
  cinema: Cinema;
  screeningTime: string;
  hall: number;
}

export interface LazyShowtime {
  id: number;
  movieTitle: string;
  cinemaName: string;
  screeningTime: string;
  hall: number;
}

export interface Cinema {
  id: number;
  name: string;
  location: string;
  totalScreens: number;
}

export interface PopularMovie {
  movieId: number;
  title: string;
  director: string;
  genre: string;
  posterUrl: string;
  rating: string;
  price: number;
  bookingCount: number;
}
