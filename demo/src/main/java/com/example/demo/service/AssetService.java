package com.example.demo.service;

import com.example.demo.enums.AssetType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.models.Asset;
import com.example.demo.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository repo;

    public Asset createAsset(Asset asset) {
        return repo.save(asset);
    }

    public List<Asset> getAllAssets() {
        return repo.findAll();
    }

    public Asset getAssetById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));
    }




    public List<Asset> getAssetsByType(AssetType assetType) {
        return repo.findByAssetType(assetType);
    }

    // Update asset — verifies existence first, protects assetCode and assetId
    public Asset updateAsset(Long id, Asset updatedAsset) {
        Asset existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with ID: " + id));

        existing.setAssetName(updatedAsset.getAssetName());
        existing.setAssetType(updatedAsset.getAssetType());
        existing.setLocation(updatedAsset.getLocation());
        existing.setManufacturer(updatedAsset.getManufacturer());
        existing.setModel(updatedAsset.getModel());
        existing.setSerialNumber(updatedAsset.getSerialNumber());
        existing.setDescription(updatedAsset.getDescription());
        existing.setPurchaseDate(updatedAsset.getPurchaseDate());
        existing.setInstallationDate(updatedAsset.getInstallationDate());
        existing.setStatus(updatedAsset.getStatus());

        return repo.save(existing);
    }

    // Delete asset — verifies existence first
    public void deleteAsset(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Asset not found with ID: " + id);
        }
        repo.deleteById(id);
    }

    // Search assets by keyword — available to all authenticated users
    public List<Asset> searchAssets(String keyword) {
        // Empty keyword → return full list
        if (keyword == null || keyword.trim().isEmpty()) {
            return repo.findAll();
        }
        return repo.searchAssets(keyword.trim());
    }
}
