import React, { useState, useEffect } from 'react';
import './ExtractionFields.css';

const FieldFormModal = ({ field, onSave, onClose }) => {
    const [fieldName, setFieldName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (field) {
            setFieldName(field.field_name || '');
            setDescription(field.description || '');
            setIsActive(field.is_active !== undefined ? field.is_active : true);
        }
    }, [field]);

    const validateFieldName = (name) => {
        if (!name || name.trim().length === 0) {
            return 'Field name is required';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            return 'Field name can only contain letters, numbers, and underscores';
        }
        if (name.length > 50) {
            return 'Field name must be 50 characters or less';
        }
        return null;
    };

    const validateDescription = (desc) => {
        if (!desc || desc.trim().length === 0) {
            return 'Description is required';
        }
        if (desc.length > 500) {
            return 'Description must be 500 characters or less';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate
        const nameError = validateFieldName(fieldName);
        const descError = validateDescription(description);

        if (nameError || descError) {
            setErrors({
                fieldName: nameError,
                description: descError,
            });
            return;
        }

        try {
            setSaving(true);
            await onSave({
                field_name: fieldName.trim(),
                description: description.trim(),
                is_active: isActive,
            });
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to save field';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleFieldNameChange = (e) => {
        const value = e.target.value;
        setFieldName(value);
        if (errors.fieldName) {
            setErrors({ ...errors, fieldName: validateFieldName(value) });
        }
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        if (errors.description) {
            setErrors({ ...errors, description: validateDescription(value) });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{field ? 'Edit Field' : 'Create New Field'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="field-form">
                    <div className="form-group">
                        <label htmlFor="fieldName">
                            Field Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="fieldName"
                            value={fieldName}
                            onChange={handleFieldNameChange}
                            placeholder="e.g., Name, Email, Product_Interest"
                            className={errors.fieldName ? 'error' : ''}
                            maxLength={50}
                        />
                        {errors.fieldName && (
                            <span className="error-text">{errors.fieldName}</span>
                        )}
                        <span className="help-text">
                            Only letters, numbers, and underscores allowed
                        </span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Extraction Instructions <span className="required">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Describe what AI should extract, e.g., 'Extract the full name of the person I'm talking to'"
                            className={errors.description ? 'error' : ''}
                            rows={4}
                            maxLength={500}
                        />
                        {errors.description && (
                            <span className="error-text">{errors.description}</span>
                        )}
                        <div className="char-counter">
                            {description.length}/500 characters
                        </div>
                    </div>

                    <div className="form-group-checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <span>Active (extract this field from new transcripts)</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (field ? 'Update Field' : 'Create Field')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FieldFormModal;
