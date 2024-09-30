package ru.zan.Pulsometer.repositories;

import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import ru.zan.Pulsometer.models.User;

@Repository
public interface UserRepository extends R2dbcRepository<User, Integer> {

}