package com.example.frauddetection.mapper;

import com.example.frauddetection.dtos.riskProfiles.ProfilesRequest;
import com.example.frauddetection.dtos.riskProfiles.ProfilesResponse;
import com.example.frauddetection.entity.user.UserRiskProfile;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProfilesMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.isEmailVerified", target = "isEmailVerified")
    @Mapping(source = "user.isPhoneVerified", target = "isPhoneVerified")
    @Mapping(source = "user.phoneNumber", target = "phoneNumber")
    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.age", target = "age")
    @Mapping(source = "riskScore", target = "riskScore")
    @Mapping(source = "riskLevel",target = "riskLevel")
    ProfilesResponse toDto(UserRiskProfile profile);

    UserRiskProfile toEntity(ProfilesResponse response);

}
