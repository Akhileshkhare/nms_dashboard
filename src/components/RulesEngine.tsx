import React, { useEffect, useState } from 'react';

const SENSOR_OPTIONS = [
  { value: 'temperature', label: 'Temperature (°C)' },
  { value: 'humidity', label: 'Humidity (%)' },
];

const OPERATOR_OPTIONS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '==', label: '==' },
  { value: 'between', label: 'between' },
];

const ACTION_TYPES = [
  { value: 'alert', label: 'Send Alert' },
  { value: 'device_control', label: 'Control Device' },
  { value: 'webhook', label: 'Call Webhook' },
];

type Condition = {
  sensor: string;
  operator: string;
  value?: string | number;
  value_min?: string | number;
  value_max?: string | number;
};

interface ConditionRowProps {
  condition: Condition;
  index: number;
  onChange: (index: number, newCond: Condition) => void;
  onRemove: (index: number) => void;
}

function ConditionRow({ condition, index, onChange, onRemove }: ConditionRowProps) {
  return (
    <div className="flex gap-2 items-center">
      <select
        className="px-2 py-1 border rounded"
        value={condition.sensor}
        onChange={(e) => onChange(index, { ...condition, sensor: e.target.value })}
      >
        {SENSOR_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <select
        className="px-2 py-1 border rounded"
        value={condition.operator}
        onChange={(e) => onChange(index, { ...condition, operator: e.target.value })}
      >
        {OPERATOR_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {condition.operator === 'between' ? (
        <>
          <input
            type="number"
            placeholder="min"
            className="px-2 py-1 border rounded w-20"
            value={condition.value_min ?? ''}
            onChange={(e) => onChange(index, { ...condition, value_min: e.target.value })}
          />
          <span className="mx-1">and</span>
          <input
            type="number"
            placeholder="max"
            className="px-2 py-1 border rounded w-20"
            value={condition.value_max ?? ''}
            onChange={(e) => onChange(index, { ...condition, value_max: e.target.value })}
          />
        </>
      ) : (
        <input
          type="number"
          placeholder="value"
          className="px-2 py-1 border rounded w-28"
          value={condition.value ?? ''}
          onChange={(e) => onChange(index, { ...condition, value: e.target.value })}
        />
      )}

      <button
        className="px-2 py-1 bg-red-500 text-white rounded"
        onClick={() => onRemove(index)}
        type="button"
      >
        Remove
      </button>
    </div>
  );
}

type Rule = {
  name: string;
  devices: string[];
  conditions: Condition[];
  logic: string;
  action:
    | { type: 'alert'; message: string }
    | { type: 'device_control'; target: string; command: string }
    | { type: 'webhook'; url: string };
  enabled: boolean;
  created_at: string;
};

export default function RuleEngineApp() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [name, setName] = useState('');
  const [logic, setLogic] = useState('AND');
  const [conditions, setConditions] = useState<Condition[]>([
    { sensor: 'temperature', operator: '>', value: '' },
  ]);
  const [actionType, setActionType] = useState('alert');
  const [actionPayload, setActionPayload] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Device selection state
  const DEVICE_OPTIONS = [
    { id: 'dev1', name: 'Device 1' },
    { id: 'dev2', name: 'Device 2' },
    { id: 'dev3', name: 'Device 3' },
    { id: 'dev4', name: 'Device 4' },
    { id: 'dev5', name: 'Device 5' },
  ];
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('iot_rules');
    if (saved) setRules(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('iot_rules', JSON.stringify(rules));
  }, [rules]);

  function addCondition() {
    setConditions((c) => [...c, { sensor: 'temperature', operator: '>', value: '' }]);
  }

  interface UpdateConditionFn {
    (i: number, newCond: Condition): void;
  }

  const updateCondition: UpdateConditionFn = (i, newCond) => {
    setConditions((c) => c.map((it, idx) => (idx === i ? newCond : it)));
  };

  function removeCondition(i:any) {
    setConditions((c) => c.filter((_, idx) => idx !== i));
  }

  function resetForm() {
    setName('');
    setLogic('AND');
    setConditions([{ sensor: 'temperature', operator: '>', value: '' }]);
    setActionType('alert');
    setActionPayload('');
    setEditingIndex(null);
    setSelectedDevices([]);
  }

  function buildRuleObject() {
    const conds = conditions.map((c) => {
      if (c.operator === 'between') {
        return { sensor: c.sensor, operator: 'between', value_min: Number(c.value_min), value_max: Number(c.value_max) };
      }
      return { sensor: c.sensor, operator: c.operator, value: Number(c.value) };
    });

    let action:
      | { type: 'alert'; message: string }
      | { type: 'device_control'; target: string; command: string }
      | { type: 'webhook'; url: string }
      = { type: 'alert', message: actionPayload || 'Alert triggered' }; // default initialization

    if (actionType === 'alert') {
      action = { type: 'alert', message: actionPayload || 'Alert triggered' };
    } else if (actionType === 'device_control') {
      // simple device command format: deviceId:command
      const parts = actionPayload.split(':');
      action = {
        type: 'device_control',
        target: parts[0] || '',
        command: parts[1] || 'toggle',
      };
    } else if (actionType === 'webhook') {
      action = { type: 'webhook', url: actionPayload };
    }

    return {
      name: name || `Rule ${rules.length + 1}`,
      devices: selectedDevices,
      conditions: conds,
      logic,
      action,
      enabled: true,
      created_at: new Date().toISOString(),
    };
  }

  function saveRule() {
    // Basic validation
    if (!name && !conditions.length) {
      alert('Please provide a name and at least one condition');
      return;
    }

    const obj = buildRuleObject();

    if (editingIndex !== null) {
      setRules((r) => r.map((it, idx) => (idx === editingIndex ? { ...it, ...obj } : it)));
      resetForm();
      return;
    }

    setRules((r) => [...r, obj]);
    resetForm();
  }

  function editRule(i: any) {
    const r = rules[i];
    setEditingIndex(i);
    setName(r.name);
    setLogic(r.logic);
    setActionType(r.action.type);
    setSelectedDevices(r.devices || []);

    if (r.action.type === 'alert') setActionPayload(r.action.message || '');
    else if (r.action.type === 'device_control') setActionPayload(`${r.action.target || ''}:${r.action.command || ''}`);
    else if (r.action.type === 'webhook') setActionPayload(r.action.url || '');

    // map conditions back
    const mapped = r.conditions.map((c: any) => {
      if (c.operator === 'between') return { sensor: c.sensor, operator: 'between', value_min: c.value_min, value_max: c.value_max };
      return { sensor: c.sensor, operator: c.operator, value: c.value };
    });

    setConditions(mapped.length ? mapped : [{ sensor: 'temperature', operator: '>', value: '' }]);
  }

  function removeRule(i: any) {
    // eslint-disable-next-line no-restricted-globals
    const isConfirmed = window.confirm('Delete this rule?');
    if (!isConfirmed) return;
    setRules((r) => r.filter((_, idx) => idx !== i));
  }

  function toggleEnable(i:any) {
    setRules((r) => r.map((it, idx) => (idx === i ? { ...it, enabled: !it.enabled } : it)));
  }

  function exportRules() {
    const data = JSON.stringify(rules, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'iot_rules.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importRules(file:any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const parsed = JSON.parse(result);
          if (Array.isArray(parsed)) setRules(parsed);
          else alert('Invalid file format');
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Invalid JSON');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Builder */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create / Edit Rule</h2>

          <div className="mb-3">
            <label className="block text-sm font-medium">Rule Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 p-2 border rounded w-full" placeholder="My high-temp rule" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Select Devices (group)</label>
            <select
              multiple
              value={selectedDevices}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                setSelectedDevices(options);
              }}
              className="mt-1 p-2 border rounded w-full h-28"
            >
              {DEVICE_OPTIONS.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple devices.</div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Logic</label>
            <select value={logic} onChange={(e) => setLogic(e.target.value)} className="mt-1 p-2 border rounded">
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Conditions</label>
            <div className="mt-2 space-y-2">
              {conditions.map((cond, idx) => (
                <ConditionRow
                  key={idx}
                  condition={cond}
                  index={idx}
                  onChange={updateCondition}
                  onRemove={removeCondition}
                />
              ))}
            </div>
            <div className="mt-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={addCondition} type="button">Add Condition</button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Action</label>
            <div className="flex gap-2 items-center mt-2">
              <select value={actionType} onChange={(e) => setActionType(e.target.value)} className="p-2 border rounded">
                {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>

              {actionType === 'alert' && (
                <input className="p-2 border rounded flex-1" placeholder="Alert message" value={actionPayload} onChange={(e) => setActionPayload(e.target.value)} />
              )}

              {actionType === 'device_control' && (
                <input className="p-2 border rounded flex-1" placeholder="deviceId:command (e.g. fan1:on)" value={actionPayload} onChange={(e) => setActionPayload(e.target.value)} />
              )}

              {actionType === 'webhook' && (
                <input className="p-2 border rounded flex-1" placeholder="https://your-webhook" value={actionPayload} onChange={(e) => setActionPayload(e.target.value)} />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveRule}>Save Rule</button>
            <button className="px-4 py-2 bg-gray-300 rounded" onClick={resetForm}>Reset</button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Preview JSON</h3>
            <pre className="bg-gray-800 text-green-200 p-3 rounded text-sm overflow-auto max-h-48">
              {JSON.stringify(buildRuleObject(), null, 2)}
            </pre>
          </div>
        </div>

        {/* Right: Rule list */}
        <div className="bg-white p-6 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Rules</h2>
            <div className="flex gap-2">
              <button className="px-2 py-1 bg-yellow-500 rounded" onClick={exportRules}>Export</button>
              <label className="px-2 py-1 bg-gray-200 rounded cursor-pointer">
                Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      importRules(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {rules.length === 0 && <p className="text-sm text-gray-500">No rules yet. Create one on the left.</p>}

          <div className="space-y-3">
            {rules.map((r, i) => (
              <div key={i} className="border rounded p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-blue-700">Devices: {r.devices && r.devices.length ? r.devices.map((id: string) => DEVICE_OPTIONS.find(d => d.id === id)?.name).join(', ') : 'None selected'}</div>
                    <div className="text-sm text-gray-600">{r.conditions.length} condition(s) • {r.logic}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Action: {r.action.type}
                      {r.action.type === 'alert' && r.action.message ? ` - ${r.action.message}` : ''}
                      {r.action.type === 'device_control' ? ` - ${r.action.target}:${r.action.command}` : ''}
                      {r.action.type === 'webhook' ? ` - ${r.action.url}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-indigo-600 text-white rounded text-sm" onClick={() => editRule(i)}>Edit</button>
                      <button className={`px-2 py-1 rounded text-sm ${r.enabled ? 'bg-green-600 text-white' : 'bg-gray-300'}`} onClick={() => toggleEnable(i)}>{r.enabled ? 'Enabled' : 'Disabled'}</button>
                    </div>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 bg-red-500 text-white rounded text-sm" onClick={() => removeRule(i)}>Delete</button>
                    </div>
                  </div>
                </div>

                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-blue-600">View JSON</summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-44">{JSON.stringify(r, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-600">Rules are stored locally (localStorage). Integrate save/enable actions with your backend to persist and evaluate server-side.</div>
        </div>
      </div>
    </div>
  );
}
