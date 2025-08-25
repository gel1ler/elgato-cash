# Структура компонентов

Компоненты организованы по логическим папкам для лучшей навигации и переиспользования.

## 📁 Структура папок

### `/ui` - Базовые UI компоненты
Переиспользуемые компоненты для создания интерфейса:
- `Card` - карточки с заголовками
- `Button` - кнопки с различными вариантами
- `Input` - поля ввода
- `Select` - выпадающие списки
- `FormField` - обертка для полей форм с лейблами
- `Badge` - статусные индикаторы
- `Table` - компоненты для создания таблиц

### `/forms` - Формы
- `CreateShiftForm` - форма создания смены
- `CreateWorkerForm` - форма создания сотрудника

### `/tables` - Таблицы данных
- `ShiftsTable` - таблица смен
- `WorkersTable` - таблица сотрудников
- `SalesTable` - таблица продаж
- `ServicesTable` - таблица услуг
- `PayoutsTable` - таблица выплат
- `WorkersServicesTable` - таблица услуг по сотрудникам

### `/shifts` - Компоненты смен
- `ShiftHeader` - заголовок смены
- `ShiftSummary` - итоги смены

### `/reports` - Компоненты отчетов
- `ReportsStats` - статистика отчетов
- `ReportsFilterForm` - фильтры для отчетов

## 🔄 Переиспользование

Все компоненты используют базовые UI компоненты для:
- Единообразного дизайна
- Легкого изменения стилей глобально
- Уменьшения дублирования кода

## 📦 Импорты

```typescript
// Импорт всех UI компонентов
import { Card, Button, Input, Table } from '@/components/ui'

// Импорт компонентов по категориям
import { CreateShiftForm } from '@/components/forms'
import { ShiftsTable } from '@/components/tables'
import { ShiftHeader } from '@/components/shifts'

// Или импорт всех компонентов
import * as Components from '@/components'
```

## 🎨 Стилизация

Все компоненты используют Tailwind CSS классы и следуют единому дизайн-системе:
- Цветовая схема: blue (primary), green (success), red (danger), purple (info)
- Размеры: sm, md, lg
- Отступы и границы стандартизированы
- Hover эффекты и transitions
