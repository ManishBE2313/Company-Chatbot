'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { ContactDetails as ContactDetailsType } from '@/types/employee';
import { Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';



interface ContactDetailsProps {
  contactDetails: ContactDetailsType;
  onUpdate?: (details: ContactDetailsType) => void;
}

export function ContactDetails({ contactDetails, onUpdate }: ContactDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ContactDetailsType>(contactDetails);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (onUpdate) {
        await onUpdate(formData);
      }
      setIsEditing(false);
   
    } catch (error) {
  
    }
  };

  const handleCancel = () => {
    setFormData(contactDetails);
    setIsEditing(false);
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-4 flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-green-500" />
          Contact Details
        </CardTitle>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
       {isEditing ? (
  <div className="space-y-4">

    <div>
      <label className="block text-sm font-medium">Work Email *</label>
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Personal Email</label>
      <input
        name="personalEmail"
        type="email"
        value={formData.personalEmail || ''}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Phone *</label>
      <input
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Address *</label>
      <input
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">City *</label>
      <input
        name="city"
        value={formData.city}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">State *</label>
      <input
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Country *</label>
      <input
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium">Zip Code *</label>
      <input
        name="zipCode"
        value={formData.zipCode}
        onChange={handleInputChange}
        className="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div className="flex gap-2 pt-4">
      <Button
        onClick={handleSave}
        className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
      >
        <Save className="h-4 w-4" />
        Save Changes
      </Button>

      <Button
        onClick={handleCancel}
        variant="outline"
        className="flex-1 gap-2"
      >
        <X className="h-4 w-4" />
        Cancel
      </Button>
    </div>

  </div>
) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Work Email</p>
                <p className="font-medium text-gray-900">{contactDetails.email}</p>
              </div>
            </div>
            {contactDetails.personalEmail && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Personal Email</p>
                  <p className="font-medium text-gray-900">{contactDetails.personalEmail}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{contactDetails.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium text-gray-900">{contactDetails.city}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Full Address</p>
                <p className="font-medium text-gray-900">
                  {contactDetails.address}, {contactDetails.city}, {contactDetails.state}{' '}
                  {contactDetails.zipCode}, {contactDetails.country}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
