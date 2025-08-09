import { DataTypes, ModelStatic, Sequelize } from 'sequelize';

/**
 * Initialize Sequelize models for Widget and WidgetType
 */
export const initializeModels = (sequelize: Sequelize) => {
  // WidgetType model definition
  const WidgetTypeModel = sequelize.define('WidgetType', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 50],
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'widget_types',
    timestamps: true,
    paranoid: false, // We'll handle soft deletes through fjell events
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // Widget model definition
  const WidgetModel = sequelize.define('Widget', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    widgetTypeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: WidgetTypeModel,
        key: 'id'
      },
      validate: {
        notEmpty: true
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'widgets',
    timestamps: true,
    paranoid: false, // We'll handle soft deletes through fjell events
    indexes: [
      {
        fields: ['widgetTypeId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['name']
      }
    ]
  });

  // Define associations
  WidgetTypeModel.hasMany(WidgetModel, {
    foreignKey: 'widgetTypeId',
    as: 'widgets'
  });

  WidgetModel.belongsTo(WidgetTypeModel, {
    foreignKey: 'widgetTypeId',
    as: 'widgetType'
  });

  return {
    WidgetTypeModel: WidgetTypeModel as ModelStatic<any>,
    WidgetModel: WidgetModel as ModelStatic<any>
  };
};
