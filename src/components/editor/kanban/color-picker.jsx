"use client"

export function ColorPicker({ colors, selectedColor, onSelect }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-3 w-48">
      <div className="mb-2">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Выберите цвет</h4>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onSelect(color)}
              className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded"
            style={{ backgroundColor: selectedColor }}
          />
          <span className="text-xs text-gray-400">{selectedColor}</span>
        </div>
      </div>
    </div>
  )
}