package com.deloitte.absolute_cinema.repository;

import com.deloitte.absolute_cinema.entity.User;
import com.deloitte.absolute_cinema.entity.UserFavouriteMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFavouriteMovieRepository extends JpaRepository<UserFavouriteMovie, Long> {
    List<UserFavouriteMovie> findByUser(User user);
}