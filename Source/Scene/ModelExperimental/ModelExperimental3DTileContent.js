import Axis from "../Axis.js";
import Color from "../../Core/Color.js";
import defined from "../../Core/defined.js";
import destroyObject from "../../Core/destroyObject.js";
import Pass from "../../Renderer/Pass.js";
import ModelExperimental from "./ModelExperimental.js";

/**
 * Represents the contents of a glTF, glb or
 * {@link https://github.com/CesiumGS/3d-tiles/tree/main/specification/TileFormats/Batched3DModel|Batched 3D Model}
 * tile in a {@link https://github.com/CesiumGS/3d-tiles/tree/main/specification|3D Tiles} tileset.
 * <p>
 * Implements the {@link Cesium3DTileContent} interface.
 * </p>
 * @alias ModelExperimental3DTileContent
 * @constructor
 * @private
 */
export default function ModelExperimental3DTileContent(
  tileset,
  tile,
  resource
) {
  this._tileset = tileset;
  this._tile = tile;
  this._resource = resource;

  this._model = undefined;
  this._groupMetadata = undefined;
}

Object.defineProperties(ModelExperimental3DTileContent.prototype, {
  featuresLength: {
    get: function () {
      const model = this._model;
      const featureTables = model.featureTables;
      const featureTableId = model.featureTableId;

      if (defined(featureTables) && defined(featureTables[featureTableId])) {
        return featureTables[featureTableId].featuresLength;
      }

      return 0;
    },
  },

  pointsLength: {
    get: function () {
      return 0;
    },
  },

  trianglesLength: {
    get: function () {
      return 0;
    },
  },

  geometryByteLength: {
    get: function () {
      return 0;
    },
  },

  texturesByteLength: {
    get: function () {
      return 0;
    },
  },

  batchTableByteLength: {
    get: function () {
      return 0;
    },
  },

  innerContents: {
    get: function () {
      return undefined;
    },
  },

  readyPromise: {
    get: function () {
      return this._model.readyPromise;
    },
  },

  tileset: {
    get: function () {
      return this._tileset;
    },
  },

  tile: {
    get: function () {
      return this._tile;
    },
  },

  url: {
    get: function () {
      return this._resource.getUrlComponent(true);
    },
  },

  batchTable: {
    get: function () {
      const model = this._model;
      const featureTables = model.featureTables;
      const featureTableId = model.featureTableId;

      if (defined(featureTables) && defined(featureTables[featureTableId])) {
        return featureTables[featureTableId];
      }

      return undefined;
    },
  },

  groupMetadata: {
    get: function () {
      return this._groupMetadata;
    },
    set: function (value) {
      this._groupMetadata = value;
    },
  },
});

ModelExperimental3DTileContent.prototype.getFeature = function (featureId) {
  const model = this._model;
  const featureTableId = model.featureTableId;
  if (!defined(featureTableId)) {
    return undefined;
  }

  const featureTable = model.featureTables[featureTableId];
  return featureTable.getFeature(featureId);
};

ModelExperimental3DTileContent.prototype.hasProperty = function (
  featureId,
  name
) {
  const model = this._model;
  const featureTableId = model.featureTableId;
  if (!defined(featureTableId)) {
    return false;
  }

  const featureTable = model.featureTables[featureTableId];
  return featureTable.hasProperty(featureId, name);
};

ModelExperimental3DTileContent.prototype.applyDebugSettings = function (
  enabled,
  color
) {
  color = enabled ? color : Color.WHITE;
  if (this.featuresLength === 0) {
    this._model.color = color;
  } else if (defined(this.batchTable)) {
    this.batchTable.setAllColor(color);
  }
};

ModelExperimental3DTileContent.prototype.applyStyle = function (style) {
  // the setter will call model.applyStyle()
  this._model.style = style;
};

ModelExperimental3DTileContent.prototype.update = function (
  tileset,
  frameState
) {
  const model = this._model;
  const tile = this._tile;

  model.colorBlendAmount = tileset.colorBlendAmount;
  model.colorBlendMode = tileset.colorBlendMode;
  model.modelMatrix = tile.computedTransform;
  model.customShader = tileset.customShader;
  model.pointCloudShading = tileset.pointCloudShading;
  model.featureIdIndex = tileset.featureIdIndex;
  model.instanceFeatureIdIndex = tileset.instanceFeatureIdIndex;
  model.backFaceCulling = tileset.backFaceCulling;

  model.update(frameState);
};

ModelExperimental3DTileContent.prototype.isDestroyed = function () {
  return false;
};

ModelExperimental3DTileContent.prototype.destroy = function () {
  this._model = this._model && this._model.destroy();
  return destroyObject(this);
};

ModelExperimental3DTileContent.fromGltf = function (
  tileset,
  tile,
  resource,
  gltf
) {
  const content = new ModelExperimental3DTileContent(tileset, tile, resource);

  const modelOptions = {
    gltf: gltf,
    cull: false, // The model is already culled by 3D Tiles
    releaseGltfJson: true, // Models are unique and will not benefit from caching so save memory
    opaquePass: Pass.CESIUM_3D_TILE, // Draw opaque portions of the model during the 3D Tiles pass
    basePath: resource,
    modelMatrix: tile.computedTransform,
    upAxis: tileset._gltfUpAxis,
    forwardAxis: Axis.X,
    incrementallyLoadTextures: false,
    customShader: tileset.customShader,
    content: content,
    colorBlendMode: tileset.colorBlendMode,
    colorBlendAmount: tileset.colorBlendAmount,
    backFaceCulling: tileset.backFaceCulling,
  };
  content._model = ModelExperimental.fromGltf(modelOptions);
  return content;
};

ModelExperimental3DTileContent.fromB3dm = function (
  tileset,
  tile,
  resource,
  arrayBuffer,
  byteOffset
) {
  const content = new ModelExperimental3DTileContent(tileset, tile, resource);

  const modelOptions = {
    arrayBuffer: arrayBuffer,
    byteOffset: byteOffset,
    resource: resource,
    cull: false, // The model is already culled by 3D Tiles
    releaseGltfJson: true, // Models are unique and will not benefit from caching so save memory
    opaquePass: Pass.CESIUM_3D_TILE, // Draw opaque portions of the model during the 3D Tiles pass
    modelMatrix: tile.computedTransform,
    upAxis: tileset._gltfUpAxis,
    forwardAxis: Axis.X,
    incrementallyLoadTextures: false,
    customShader: tileset.customShader,
    content: content,
    colorBlendMode: tileset.colorBlendMode,
    colorBlendAmount: tileset.colorBlendAmount,
  };
  content._model = ModelExperimental.fromB3dm(modelOptions);
  return content;
};

ModelExperimental3DTileContent.fromI3dm = function (
  tileset,
  tile,
  resource,
  arrayBuffer,
  byteOffset
) {
  const content = new ModelExperimental3DTileContent(tileset, tile, resource);

  const modelOptions = {
    arrayBuffer: arrayBuffer,
    byteOffset: byteOffset,
    resource: resource,
    cull: false, // The model is already culled by 3D Tiles
    releaseGltfJson: true, // Models are unique and will not benefit from caching so save memory
    opaquePass: Pass.CESIUM_3D_TILE, // Draw opaque portions of the model during the 3D Tiles pass
    modelMatrix: tile.computedTransform,
    upAxis: tileset._gltfUpAxis,
    forwardAxis: Axis.X,
    incrementallyLoadTextures: false,
    customShader: tileset.customShader,
    content: content,
    colorBlendMode: tileset.colorBlendMode,
    colorBlendAmount: tileset.colorBlendAmount,
  };
  content._model = ModelExperimental.fromI3dm(modelOptions);
  return content;
};

ModelExperimental3DTileContent.fromPnts = function (
  tileset,
  tile,
  resource,
  arrayBuffer,
  byteOffset
) {
  const content = new ModelExperimental3DTileContent(tileset, tile, resource);

  const modelOptions = {
    arrayBuffer: arrayBuffer,
    byteOffset: byteOffset,
    resource: resource,
    cull: false, // The model is already culled by 3D Tiles
    releaseGltfJson: true, // Models are unique and will not benefit from caching so save memory
    opaquePass: Pass.CESIUM_3D_TILE, // Draw opaque portions of the model during the 3D Tiles pass
    modelMatrix: tile.computedTransform,
    upAxis: tileset._gltfUpAxis,
    forwardAxis: Axis.X,
    incrementallyLoadTextures: false,
    customShader: tileset.customShader,
    content: content,
    colorBlendMode: tileset.colorBlendMode,
    colorBlendAmount: tileset.colorBlendAmount,
  };
  content._model = ModelExperimental.fromPnts(modelOptions);
  return content;
};
