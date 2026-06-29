package com.example.demo.repository;

import com.example.demo.enums.AssetType;
import com.example.demo.models.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    List<Asset> findByAssetType(AssetType assetType);

    @Query("SELECT a FROM Asset a WHERE " +
           "LOWER(a.assetCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.assetName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(a.assetType AS string)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.model) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.serialNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(CAST(a.status AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Asset> searchAssets(@Param("keyword") String keyword);
}
