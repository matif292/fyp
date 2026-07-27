import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../services/hostel_service.dart';
import 'room_management_screen.dart';

class AddEditHostelScreen extends StatefulWidget {
  final Hostel? existing;
  const AddEditHostelScreen({super.key, this.existing});

  @override
  State<AddEditHostelScreen> createState() => _AddEditHostelScreenState();
}

class _AddEditHostelScreenState extends State<AddEditHostelScreen> {
  final _formKey = GlobalKey<FormState>();
  final _service = HostelService();
  late final TextEditingController _name;
  late final TextEditingController _city;
  late final TextEditingController _description;
  late final TextEditingController _propertyType;
  final List<File> _newPhotos = [];
  bool _loading = false;
  String? _error;

  bool get _isEdit => widget.existing != null;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.existing?.name ?? '');
    _city = TextEditingController(text: widget.existing?.city ?? '');
    _description = TextEditingController(text: widget.existing?.description ?? '');
    _propertyType = TextEditingController(text: widget.existing?.propertyType ?? '');
  }

  Future<void> _pickPhotos() async {
    final picker = ImagePicker();
    final picked = await picker.pickMultiImage(imageQuality: 85);
    if (picked.isNotEmpty) {
      setState(() => _newPhotos.addAll(picked.map((x) => File(x.path))));
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (_isEdit) {
        await _service.updateHostel(widget.existing!.id, {
          'name': _name.text.trim(),
          'city': _city.text.trim(),
          'description': _description.text.trim(),
          'property_type': _propertyType.text.trim(),
        });
      } else {
        await _service.createHostel({
          'name': _name.text.trim(),
          'city': _city.text.trim(),
          'description': _description.text.trim(),
          'property_type': _propertyType.text.trim(),
        }, _newPhotos.map((f) => f.path).toList());
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = apiErrorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Edit hostel' : 'Add hostel')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Property name'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _city,
                  decoration: const InputDecoration(labelText: 'City (e.g. Hunza, Nankana Sahib)'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _propertyType,
                  decoration: const InputDecoration(labelText: 'Property type (hostel / guesthouse / hotel)'),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _description,
                  maxLines: 4,
                  decoration: const InputDecoration(labelText: 'Description'),
                ),
                if (!_isEdit) ...[
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: _pickPhotos,
                    icon: const Icon(Icons.add_photo_alternate_outlined),
                    label: Text(_newPhotos.isEmpty ? 'Add photos' : '${_newPhotos.length} photo(s) selected'),
                  ),
                ],
                if (_isEdit) ...[
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () => Navigator.push(context,
                        MaterialPageRoute(builder: (_) => RoomManagementScreen(hostelId: widget.existing!.id))),
                    icon: const Icon(Icons.meeting_room_outlined),
                    label: const Text('Manage rooms'),
                  ),
                ],
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_isEdit ? 'Save changes' : 'Create hostel'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
