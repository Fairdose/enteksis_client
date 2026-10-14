<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDeskStore } from '~store/desk'
import { usePreferencesStore } from '~store/preferences'

type Task = {
  id: string
  project: string
  title: string
  description: string
  priority: string
  op_state: string
  acc_state: string
  due_date: string | null
  assignee: string
  primary_assignment_id: string
  allowed_actions: string[]
}
type Group =
  | 'assigned'
  | 'owned'
  | 'reviewing'
  | 'contributing'
  | 'overdue'
  | 'blocked'
  | 'due_today'
  | 'waiting_on_others'
type Desk = Record<Group, Task[]>
type Person = { id: string; name: string }
type Detail = {
  task: Task
  can_add_assignment: boolean
  can_end_assignment: boolean
  can_add_checklist: boolean
  can_check: boolean
  assignments: { id: string; role: string; name: string; actor_id: string }[]
  blockers: { id: string; reason: string; resolved: boolean }[]
  checklist: { id: string; title: string; is_done: boolean }[]
  criteria: { id: string; description: string; required_evidence_type: string }[]
  submissions: {
    id: string
    iteration: number
    note: string
    decision: string | null
    evidences: { criterion_id: string; resource_url: string }[]
  }[]
}

const deskSession = useDeskStore()
const preferences = usePreferencesStore()
const emptyDesk = (): Desk => ({
  assigned: [],
  owned: [],
  reviewing: [],
  contributing: [],
  overdue: [],
  blocked: [],
  due_today: [],
  waiting_on_others: [],
})
const desk = ref<Desk>(emptyDesk())
const people = ref<Person[]>([])
const projects = ref<Person[]>([])
const me = ref('')
const canManage = ref(false)
const workspace = ref('ent-challange')
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const notice = ref('')
const selected = ref<Detail | null>(null)
const showCreate = ref(false)
const showSetup = ref(false)
const activeGroup = ref<Group>('assigned')
const projectName = ref('')
const personName = ref('')
const personEmail = ref('')
const personPassword = ref('')
const taskForm = ref({
  project_id: '',
  title: '',
  description: '',
  priority: 'medium',
  due_date: '',
  assignee_id: '',
  reviewer_id: '',
  purpose: '',
  delivery_format: '',
})
const actionNote = ref('')
const criteriaText = ref('')
const requireEvidence = ref(false)
const evidenceUrls = ref<Record<string, string>>({})
const submissionLink = ref('')
const failedCriteria = ref<string[]>([])
const reassignActor = ref('')
const participantActor = ref('')
const participantRole = ref('contributor')
function openSetupFromCreate() { showCreate.value = false; showSetup.value = true }
const checklistTitle = ref('')

const labels: Record<Group, string> = {
  assigned: 'Bana Atananlar',
  owned: 'Sahibi Olduklarım',
  reviewing: 'İncelemem Gerekenler',
  contributing: 'Katkı Verdiklerim',
  overdue: 'Gecikenler',
  blocked: 'Engelliler',
  due_today: 'Bugün Son Gün',
  waiting_on_others: 'Başkasından Beklediklerim',
}
const stateLabels: Record<string, string> = {
  planned: 'Planlandı',
  ready: 'Hazır',
  in_progress: 'Devam ediyor',
  work_completed: 'Teslim edildi',
  blocked: 'Engelli',
  closed: 'Kapandı',
  cancelled: 'İptal',
  under_review: 'İncelemede',
  revision_needed: 'Revizyon gerekli',
  accepted: 'Kabul edildi',
}
const actionLabels: Record<string, string> = {
  ready: 'Hazır yap',
  start: 'Çalışmaya başla',
  submit: 'Teslim et',
  block: 'Engel ekle',
  resolve: 'Engeli çöz',
  accept: 'Kabul et',
  request_revision: 'Revizyon iste',
  reassign: 'Yeniden ata',
  cancel: 'Görevi iptal et',
}
const currentItems = computed(() => desk.value[activeGroup.value])
const alarmCount = computed(
  () => desk.value.overdue.length + desk.value.blocked.length + desk.value.due_today.length,
)

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Istanbul',
      }).format(new Date(value))
    : 'Tarih yok'
}
function initials(value: string) {
  return value
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toLocaleUpperCase('tr-TR')
}
function api<T>(path: string, init?: RequestInit) {
  return deskSession.deskFetch<T>(path, init)
}
function mutation<T>(path: string, body: object) {
  return api<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify(body),
  })
}
async function refresh() {
  loading.value = true
  error.value = ''
  try {
    const [context, board] = await Promise.all([
      api<{
        workspace: { name: string }
        me: { id: string; admin: boolean }
        actors: Person[]
        projects: Person[]
      }>('/desk/context'),
      api<Desk>('/my-dashboard'),
    ])
    workspace.value = context.workspace.name
    people.value = context.actors
    projects.value = context.projects
    me.value = context.me.id
    canManage.value = context.me.admin
    desk.value = board
    if (!taskForm.value.project_id && projects.value.length)
      taskForm.value.project_id = projects.value[0]!.id
    if (!taskForm.value.assignee_id) taskForm.value.assignee_id = me.value
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Masa yüklenemedi.'
  } finally {
    loading.value = false
  }
}
async function openTask(id: string) {
  error.value = ''
  try {
    selected.value = await api<Detail>(`/tasks/${encodeURIComponent(id)}`)
    actionNote.value = ''
    evidenceUrls.value = {}
    submissionLink.value = ''
    failedCriteria.value = []
    reassignActor.value = ''
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Görev açılamadı.'
  }
}
async function perform(action: string) {
  if (!selected.value || busy.value) return
  if (action === 'cancel' && !window.confirm('Bu görevi iptal etmek istiyor musunuz?')) return
  busy.value = true
  error.value = ''
  notice.value = ''
  const id = selected.value.task.id
  try {
    if (action === 'reassign') {
      await mutation(`/tasks/${id}/reassign`, {
        new_actor_id: reassignActor.value,
        reason: actionNote.value,
        expected_primary_assignment_id: selected.value.task.primary_assignment_id,
      })
    } else if (action === 'accept' || action === 'request_revision') {
      const submission = selected.value.submissions.find((item) => !item.decision)
      if (!submission) throw new Error('İncelenecek teslim bulunamadı.')
      await mutation(`/submissions/${submission.id}/review`, {
        action,
        comments: actionNote.value,
        failed_criteria_ids: action === 'request_revision' ? failedCriteria.value : [],
      })
    } else if (action === 'resolve') {
      const blocker = selected.value.blockers.find((item) => !item.resolved)
      if (!blocker) throw new Error('Açık engel bulunamadı.')
      await mutation(`/tasks/${id}/blockers/${blocker.id}/resolve`, { reason: actionNote.value })
    } else if (action === 'submit') {
      if (
        selected.value.criteria.some(
          (criterion) =>
            criterion.required_evidence_type && !evidenceUrls.value[criterion.id]?.trim(),
        )
      )
        throw new Error('Zorunlu kabul ölçütleri için kanıt bağlantısı ekleyin.')
      const evidences = selected.value.criteria
        .filter((criterion) => evidenceUrls.value[criterion.id]?.trim())
        .map((criterion) => ({
          criterion_id: criterion.id,
          resource_url: evidenceUrls.value[criterion.id]!.trim(),
        }))
      if (submissionLink.value.trim())
        evidences.push({ criterion_id: '', resource_url: submissionLink.value.trim() })
      await mutation(`/tasks/${id}/submit`, { reason: '', note: actionNote.value, evidences })
    } else {
      const path = action === 'block' ? 'blockers' : action
      await mutation(`/tasks/${id}/${path}`, { reason: actionNote.value, note: actionNote.value })
    }
    notice.value = `${actionLabels[action]} işlemi kaydedildi.`
    await refresh()
    if (action === 'cancel') selected.value = null
    else await openTask(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'İşlem başarısız.'
  } finally {
    busy.value = false
  }
}
async function addAssignment() {
  if (!selected.value || !participantActor.value || busy.value) return
  busy.value = true
  error.value = ''
  const id = selected.value.task.id
  try {
    await mutation(`/tasks/${id}/assignments`, {
      actor_id: participantActor.value,
      role: participantRole.value,
    })
    notice.value = 'Katılımcı eklendi.'
    participantActor.value = ''
    await refresh()
    await openTask(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Katılımcı eklenemedi.'
  } finally {
    busy.value = false
  }
}
async function endAssignment(assignmentId: string) {
  if (!selected.value || busy.value) return
  busy.value = true
  error.value = ''
  const id = selected.value.task.id
  try {
    await mutation(`/tasks/${id}/assignments/${assignmentId}/end`, { reason: actionNote.value })
    notice.value = 'Katılım sonlandırıldı.'
    await refresh()
    await openTask(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Katılım sonlandırılamadı.'
  } finally {
    busy.value = false
  }
}
async function addChecklist() {
  if (!selected.value || !checklistTitle.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  const id = selected.value.task.id
  try {
    await mutation(`/tasks/${id}/checklist`, { title: checklistTitle.value.trim() })
    checklistTitle.value = ''
    notice.value = 'Kontrol maddesi eklendi.'
    await openTask(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Madde eklenemedi.'
  } finally {
    busy.value = false
  }
}
async function toggleChecklist(itemId: string, isDone: boolean) {
  if (!selected.value || busy.value) return
  busy.value = true
  error.value = ''
  const id = selected.value.task.id
  try {
    await api(`/tasks/${id}/checklist/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify({ is_done: isDone }),
    })
    await openTask(id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Madde güncellenemedi.'
  } finally {
    busy.value = false
  }
}
async function createProject() {
  if (!projectName.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  try {
    await mutation('/projects', { name: projectName.value.trim(), description: '' })
    projectName.value = ''
    notice.value = 'Proje oluşturuldu.'
    await refresh()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Proje oluşturulamadı.'
  } finally {
    busy.value = false
  }
}
async function createPerson() {
  if (!personName.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  try {
    await mutation('/actors', {
      name: personName.value.trim(),
      email: personEmail.value.trim(),
      password: personPassword.value,
    })
    personName.value = ''
    personEmail.value = ''
    personPassword.value = ''
    notice.value = 'Ekip üyesi eklendi.'
    await refresh()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Kişi eklenemedi.'
  } finally {
    busy.value = false
  }
}
async function createTask() {
  if (!taskForm.value.title.trim() || !taskForm.value.project_id || busy.value) return
  busy.value = true
  error.value = ''
  try {
    await mutation('/tasks', {
      ...taskForm.value,
      title: taskForm.value.title.trim(),
      due_date: taskForm.value.due_date ? new Date(taskForm.value.due_date).toISOString() : null,
      acceptance_criteria: criteriaText.value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((description) => ({
          description,
          required_evidence_type: requireEvidence.value ? 'url' : '',
        })),
    })
    taskForm.value.title = ''
    taskForm.value.description = ''
    taskForm.value.due_date = ''
    taskForm.value.purpose = ''
    taskForm.value.delivery_format = ''
    criteriaText.value = ''
    showCreate.value = false
    notice.value = 'Görev oluşturuldu.'
    activeGroup.value = 'owned'
    await refresh()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Görev oluşturulamadı.'
  } finally {
    busy.value = false
  }
}
onMounted(() => {
  preferences.locale = 'tr'
  void refresh()
})
</script>

<template>
  <div class="desk-page">
    <div class="desk-heading">
      <div>
        <p class="desk-eyebrow">
          <span class="desk-live-dot"></span> {{ workspace }} / Operasyon merkezi
        </p>
        <h1>Benim Masam<span class="desk-heading-dot">.</span></h1>
        <p class="desk-subtitle">İşin sahibi, teslimi ve bekleyen kararlar tek yerde.</p>
      </div>
      <div class="desk-heading-actions">
        <a class="desk-text-link" href="/ent-challange-urun-tanitimi.pdf" target="_blank" rel="noopener"
          >Ürün tanıtımı <span aria-hidden="true">↗</span></a
        >
        <button
          v-if="canManage"
          class="desk-button desk-button-muted"
          type="button"
          @click="showSetup = true"
        >
          Ekip ve proje
        </button>
        <button
          v-if="canManage"
          class="desk-button desk-button-primary"
          type="button"
          @click="showCreate = true"
        >
          + Yeni görev
        </button>
      </div>
    </div>

    <p
      v-if="error && !selected && !showCreate && !showSetup"
      class="desk-message desk-error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-if="notice && !selected && !showCreate && !showSetup"
      class="desk-message desk-notice"
      role="status"
    >
      {{ notice }}
    </p>
    <div v-if="loading" class="desk-loading" role="status">Masanız hazırlanıyor…</div>
    <template v-else>
      <div class="desk-intro">
        <span class="desk-intro-icon">✳</span>
        <div>
          <strong>Bugün odaklanmanız gerekenler</strong>
          <p>
            {{
              alarmCount
                ? `${alarmCount} kritik kayıt dikkatinizi bekliyor.`
                : canManage
                  ? 'Şu an kritik bir kayıt yok. Yeni bir görev açarak başlayabilirsiniz.'
                  : 'Şu an kritik bir kayıt yok.'
            }}
          </p>
        </div>
        <span class="desk-intro-date">{{
          new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(new Date())
        }}</span>
      </div>

      <div class="desk-alarm-grid" aria-label="Öncelikli gruplar">
        <button
          v-for="group in ['overdue', 'blocked', 'due_today'] as Group[]"
          :key="group"
          type="button"
          class="desk-alarm"
          :class="[`desk-alarm-${group}`, { 'desk-alarm-active': activeGroup === group }]"
          @click="activeGroup = group"
        >
          <span class="desk-alarm-top"
            ><span>{{ labels[group] }}</span
            ><span aria-hidden="true">↗</span></span
          >
          <strong>{{ desk[group].length.toString().padStart(2, '0') }}</strong>
          <small>{{
            group === 'overdue'
              ? 'Son tarihi geçti'
              : group === 'blocked'
                ? 'İlerleme bekliyor'
                : 'Bugün tamamlanmalı'
          }}</small>
        </button>
      </div>

      <div class="desk-workspace-grid">
        <section class="desk-panel desk-main-panel" aria-labelledby="desk-list-title">
          <div class="desk-panel-heading">
            <div>
              <p class="desk-section-kicker">İŞ AKIŞI</p>
              <h2 id="desk-list-title">{{ labels[activeGroup] }}</h2>
            </div>
            <span class="desk-count">{{ currentItems.length }} görev</span>
          </div>
          <div class="desk-tabs" role="group" aria-label="Görev grupları">
            <button
              v-for="group in [
                'assigned',
                'reviewing',
                'owned',
                'waiting_on_others',
                'contributing',
              ] as Group[]"
              :key="group"
              type="button"
              :class="{ active: activeGroup === group }"
              @click="activeGroup = group"
            >
              {{ labels[group] }} <span>{{ desk[group].length }}</span>
            </button>
          </div>
          <div v-if="!currentItems.length" class="desk-empty">
            <span>✳</span><strong>Bu grupta görev yok</strong>
            <p>Size atanan işler ve kararlar burada görünür.</p>
            <button
              v-if="canManage"
              class="desk-button desk-button-primary"
              type="button"
              @click="showCreate = true"
            >
              Görev oluştur
            </button>
          </div>
          <div v-else class="desk-task-list">
            <button
              v-for="task in currentItems"
              :key="task.id"
              class="desk-task-row"
              type="button"
              @click="openTask(task.id)"
            >
              <span class="desk-task-mark" :class="`desk-priority-${task.priority}`"></span>
              <span class="desk-task-main"
                ><small
                  >{{ task.project }} <span>·</span>
                  {{ stateLabels[task.op_state] || task.op_state }}</small
                ><strong>{{ task.title }}</strong
                ><span>{{ task.assignee || 'Atama bekliyor' }}</span></span
              >
              <span class="desk-task-due">{{ formatDate(task.due_date) }}</span
              ><span class="desk-task-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </section>
        <aside class="desk-side">
          <div class="desk-side-panel">
            <p class="desk-section-kicker">GENEL BAKIŞ</p>
            <h2>Sorumluluk alanım</h2>
            <button type="button" @click="activeGroup = 'owned'">
              <span>Sahibi olduklarım</span><strong>{{ desk.owned.length }}</strong></button
            ><button type="button" @click="activeGroup = 'waiting_on_others'">
              <span>Başkasından beklediklerim</span
              ><strong>{{ desk.waiting_on_others.length }}</strong></button
            ><button type="button" @click="activeGroup = 'contributing'">
              <span>Katkı verdiklerim</span><strong>{{ desk.contributing.length }}</strong>
            </button>
          </div>
          <div class="desk-guide">
            <span>01 / V0.1</span>
            <h3>Net sahiplik.<br />Görünür ilerleme.</h3>
            <p>Her görevde tek sahip, aktif sorumlu ve değişmez teslim geçmişi.</p>
            <a href="/ent-challange-urun-tanitimi.pdf" target="_blank" rel="noopener"
              >Ürün yaklaşımını incele ↗</a
            >
          </div>
        </aside>
      </div>
    </template>

    <div v-if="selected" class="desk-overlay" @click.self="selected = null">
      <section
        class="desk-drawer"
        role="dialog"
        aria-modal="true"
        :aria-label="selected.task.title"
      >
        <div class="desk-drawer-head">
          <span>GÖREV DETAYI</span
          ><button type="button" aria-label="Kapat" @click="selected = null">×</button>
        </div>
        <p v-if="error" class="desk-message desk-error" role="alert">{{ error }}</p>
        <p v-if="notice" class="desk-message desk-notice" role="status">{{ notice }}</p>
        <p class="desk-detail-project">{{ selected.task.project }}</p>
        <h2>{{ selected.task.title }}</h2>
        <p class="desk-detail-description">
          {{ selected.task.description || 'Açıklama eklenmemiş.' }}
        </p>
        <div class="desk-detail-meta">
          <span>{{ stateLabels[selected.task.op_state] || selected.task.op_state }}</span
          ><span>{{ formatDate(selected.task.due_date) }}</span>
        </div>
        <h3>Atamalar</h3>
        <div v-for="person in selected.assignments" :key="person.id" class="desk-person">
          <span class="desk-avatar">{{ initials(person.name) }}</span
          ><span
            >{{ person.name
            }}<small>{{
              person.role === 'owner'
                ? 'Sahip'
                : person.role === 'primary_assignee'
                  ? 'Aktif sorumlu'
                  : person.role === 'reviewer'
                    ? 'İnceleyen'
                    : 'Katılımcı'
            }}</small></span
          >
          <button
            v-if="
              selected.can_end_assignment && !['owner', 'primary_assignee'].includes(person.role)
            "
            class="desk-end-link"
            type="button"
            :aria-label="`${person.name} katılımını bitir`"
            :disabled="busy"
            @click="endAssignment(person.id)"
          >
            Bitir
          </button>
        </div>
        <form
          v-if="
            selected.can_add_assignment && !['closed', 'cancelled'].includes(selected.task.op_state)
          "
          class="desk-participant-form"
          @submit.prevent="addAssignment"
        >
          <label for="desk-participant">Katılımcı ekle</label>
          <select id="desk-participant" v-model="participantActor" required>
            <option value="">Kişi seçin</option>
            <option v-for="person in people" :key="person.id" :value="person.id">
              {{ person.name }}
            </option>
          </select>
          <select v-model="participantRole" aria-label="Katılım rolü">
            <option value="contributor">Katkıcı</option>
            <option value="reviewer">İnceleyen</option>
            <option value="observer">Gözlemci</option>
          </select>
          <button class="desk-button desk-button-muted" type="submit" :disabled="busy">Ekle</button>
        </form>
        <section
          v-if="selected.checklist.length || selected.can_add_checklist"
          class="desk-checklist"
        >
          <h3>Kontrol listesi</h3>
          <label v-for="item in selected.checklist" :key="item.id" class="desk-check-item">
            <input
              type="checkbox"
              :checked="item.is_done"
              :disabled="!selected.can_check || busy"
              @change="toggleChecklist(item.id, !item.is_done)"
            />
            <span :class="{ done: item.is_done }">{{ item.title }}</span>
          </label>
          <form
            v-if="selected.can_add_checklist"
            class="desk-check-add"
            @submit.prevent="addChecklist"
          >
            <input
              v-model="checklistTitle"
              minlength="3"
              maxlength="500"
              required
              placeholder="Yeni kontrol maddesi"
            />
            <button type="submit" :disabled="busy">Ekle</button>
          </form>
        </section>
        <section v-if="selected.criteria.length" class="desk-criteria">
          <h3>Kabul ölçütleri</h3>
          <div v-for="criterion in selected.criteria" :key="criterion.id" class="desk-criterion">
            <p>{{ criterion.description }}</p>
            <small v-if="criterion.required_evidence_type">Kanıt bağlantısı gerekli</small>
            <label v-if="selected.task.allowed_actions.includes('submit')">
              Kanıt bağlantısı
              <input
                v-model="evidenceUrls[criterion.id]"
                type="url"
                placeholder="https://…"
                :required="Boolean(criterion.required_evidence_type)"
              />
            </label>
            <label
              v-if="selected.task.allowed_actions.includes('request_revision')"
              class="desk-criterion-check"
            >
              <input v-model="failedCriteria" type="checkbox" :value="criterion.id" /> Bu ölçüt
              karşılanmadı
            </label>
          </div>
        </section>
        <template v-if="selected.blockers.length"
          ><h3>Engeller</h3>
          <p v-for="blocker in selected.blockers" :key="blocker.id" class="desk-history">
            {{ blocker.resolved ? '✓' : '●' }} {{ blocker.reason }}
          </p></template
        ><template v-if="selected.submissions.length"
          ><h3>Teslim geçmişi</h3>
          <div v-for="submission in selected.submissions" :key="submission.id" class="desk-history">
            #{{ submission.iteration }} · {{ submission.note || 'Açıklama yok' }} ·
            {{ submission.decision ? stateLabels[submission.decision] : 'İncelemede' }}
            <a
              v-for="evidence in submission.evidences"
              :key="evidence.resource_url"
              :href="evidence.resource_url"
              target="_blank"
              rel="noopener"
              >Kanıtı aç ↗</a
            >
          </div></template
        >
        <div class="desk-action-area">
          <label v-if="selected.task.allowed_actions.includes('submit')" for="desk-submission-link"
            >Genel teslim bağlantısı<input
              id="desk-submission-link"
              v-model="submissionLink"
              type="url"
              placeholder="https://…"
          /></label>
          <label for="desk-action-note">İşlem notu / engel gerekçesi</label
          ><textarea
            id="desk-action-note"
            v-model="actionNote"
            rows="2"
            placeholder="Kararınızı veya teslim notunuzu yazın"
          ></textarea
          ><template v-if="selected.task.allowed_actions.includes('reassign')"
            ><label for="desk-reassign">Yeni sorumlu</label
            ><select id="desk-reassign" v-model="reassignActor">
              <option value="">Kişi seçin</option>
              <option v-for="person in people" :key="person.id" :value="person.id">
                {{ person.name }}
              </option>
            </select></template
          >
          <div class="desk-action-buttons">
            <button
              v-for="action in selected.task.allowed_actions"
              :key="action"
              type="button"
              class="desk-button"
              :class="
                action === 'accept' || action === 'start'
                  ? 'desk-button-primary'
                  : 'desk-button-muted'
              "
              :disabled="busy || (action === 'reassign' && !reassignActor)"
              @click="perform(action)"
            >
              {{ actionLabels[action] }}
            </button>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showCreate" class="desk-overlay" @click.self="showCreate = false">
      <section class="desk-drawer" role="dialog" aria-modal="true" aria-label="Yeni görev">
        <div class="desk-drawer-head">
          <span>YENİ GÖREV</span
          ><button type="button" aria-label="Kapat" @click="showCreate = false">×</button>
        </div>
        <p v-if="error" class="desk-message desk-error" role="alert">{{ error }}</p>
        <h2>İşi tanımlayın.</h2>
        <p class="desk-detail-description">
          Sahiplik, sorumlu ve beklenen çıktıyı baştan netleştirin.
        </p>
        <form class="desk-form" @submit.prevent="createTask">
          <label
            >Proje<select v-model="taskForm.project_id" required>
              <option value="">Proje seçin</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select></label
          ><button
            v-if="!projects.length"
            type="button"
            class="desk-text-link"
            @click="openSetupFromCreate"
          >
            Önce proje oluştur →</button
          ><label
            >Görev başlığı<input
              v-model="taskForm.title"
              required
              minlength="3"
              maxlength="500"
              placeholder="Örn. Müşteri teklifini tamamla" /></label
          ><label
            >Açıklama<textarea
              v-model="taskForm.description"
              rows="3"
              placeholder="Yapılacak işi özetleyin"
            ></textarea>
          </label>
          <div class="desk-form-pair">
            <label
              >Öncelik<select v-model="taskForm.priority">
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
              </select></label
            ><label>Son tarih<input v-model="taskForm.due_date" type="datetime-local" /></label>
          </div>
          <div class="desk-form-pair">
            <label
              >Aktif sorumlu<select v-model="taskForm.assignee_id">
                <option v-for="person in people" :key="person.id" :value="person.id">
                  {{ person.name }}
                </option>
              </select></label
            ><label
              >İnceleyen<select v-model="taskForm.reviewer_id">
                <option value="">İnceleme yok</option>
                <option v-for="person in people" :key="person.id" :value="person.id">
                  {{ person.name }}
                </option>
              </select></label
            >
          </div>
          <label
            >İşin amacı<input v-model="taskForm.purpose" placeholder="Neden yapılıyor?" /></label
          ><label
            >Beklenen teslim<input
              v-model="taskForm.delivery_format"
              placeholder="Örn. bağlantı veya rapor" /></label
          ><label
            >Kabul ölçütleri (her satıra bir ölçüt)<textarea
              v-model="criteriaText"
              rows="3"
              placeholder="Teslimde hangi sonuçları doğrulayacağız?"
            ></textarea></label
          ><label class="desk-checkbox"
            ><input v-model="requireEvidence" type="checkbox" /> Her ölçüt için kanıt bağlantısı
            iste</label
          ><button
            class="desk-button desk-button-primary"
            type="submit"
            :disabled="busy || !projects.length"
          >
            Görevi oluştur
          </button>
        </form>
      </section>
    </div>
    <div v-if="showSetup" class="desk-overlay" @click.self="showSetup = false">
      <section class="desk-drawer" role="dialog" aria-modal="true" aria-label="Ekip ve proje">
        <div class="desk-drawer-head">
          <span>ÇALIŞMA ALANI</span
          ><button type="button" aria-label="Kapat" @click="showSetup = false">×</button>
        </div>
        <p v-if="error" class="desk-message desk-error" role="alert">{{ error }}</p>
        <p v-if="notice" class="desk-message desk-notice" role="status">{{ notice }}</p>
        <h2>Ekip ve proje.</h2>
        <p class="desk-detail-description">
          Görevleri gerçek ekip üyelerine ve projelere bağlayın.
        </p>
        <form class="desk-form" @submit.prevent="createProject">
          <h3>Yeni proje</h3>
          <label
            >Proje adı<input
              v-model="projectName"
              required
              minlength="2"
              maxlength="255"
              placeholder="Örn. Web sitesi yenileme" /></label
          ><button class="desk-button desk-button-primary" type="submit" :disabled="busy">
            Projeyi oluştur
          </button>
        </form>
        <form class="desk-form desk-setup-second" @submit.prevent="createPerson">
          <h3>Ekip üyesi</h3>
          <label
            >Ad soyad<input
              v-model="personName"
              required
              minlength="2"
              maxlength="255"
              placeholder="Örn. Ayşe Yılmaz" /></label
          ><label
            >E-posta<input
              v-model="personEmail"
              type="email"
              required
              autocomplete="off"
              placeholder="ayse@ornek.com" /></label
          ><label
            >İlk şifre<input
              v-model="personPassword"
              type="password"
              required
              minlength="12"
              autocomplete="new-password"
              placeholder="En az 12 karakter" /></label
          ><button class="desk-button desk-button-muted" type="submit" :disabled="busy">
            Kişiyi ekle
          </button>
        </form>
        <p class="desk-setup-note">
          Ekip üyesi kendi e-postası ve ilk şifresiyle Benim Masam’a giriş yapabilir.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.desk-page {
  color: #1b2131;
  font-family: 'DM Sans', sans-serif;
}
.desk-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 2rem;
  margin-bottom: 2.3rem;
}
.desk-eyebrow,
.desk-section-kicker {
  margin: 0 0 0.85rem;
  color: #4261af;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.desk-live-dot {
  display: inline-block;
  width: 0.48rem;
  height: 0.48rem;
  margin-right: 0.35rem;
  border-radius: 50%;
  background: #82ba56;
  box-shadow: 0 0 0 0.23rem #e7f0e1;
}
.desk-heading h1 {
  margin: 0;
  font:
    600 clamp(2.7rem, 5vw, 4.7rem)/1 'Manrope',
    sans-serif;
  letter-spacing: -0.065em;
}
.desk-heading-dot {
  color: #315bea;
}
.desk-subtitle {
  margin: 0.8rem 0 0;
  color: #687183;
  font-size: 1rem;
}
.desk-heading-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}
.desk-button {
  min-height: 2.8rem;
  padding: 0.67rem 1rem;
  border: 1px solid #dce1ea;
  border-radius: 0.65rem;
  font-size: 0.81rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}
.desk-button:hover {
  transform: translateY(-2px);
}
.desk-button:disabled {
  opacity: 0.48;
  cursor: not-allowed;
  transform: none;
}
.desk-button-primary {
  color: white;
  border-color: #315bea;
  background: #315bea;
  box-shadow: 0 7px 17px #315bea22;
}
.desk-button-muted {
  color: #273750;
  background: #fff;
}
.desk-text-link {
  border: 0;
  color: #315bea;
  background: transparent;
  font-size: 0.83rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}
.desk-text-link span {
  margin-left: 0.25rem;
}
.desk-message {
  padding: 1rem 1.2rem;
  border-radius: 0.7rem;
  font-size: 0.85rem;
}
.desk-error {
  color: #84291f;
  background: #fff0ed;
}
.desk-notice {
  color: #1c6544;
  background: #e4f5eb;
}
.desk-loading {
  padding: 5rem;
  text-align: center;
  color: #687183;
}
.desk-intro {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 1.2rem 1.4rem;
  border: 1px solid #e3e7ed;
  border-radius: 1rem;
  background: #fff;
}
.desk-intro-icon {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  place-items: center;
  border-radius: 0.75rem;
  color: #315bea;
  background: #eaf0ff;
  font-size: 1.4rem;
}
.desk-intro strong {
  font-size: 0.89rem;
}
.desk-intro p {
  margin: 0.25rem 0 0;
  color: #737c8b;
  font-size: 0.79rem;
}
.desk-intro-date {
  margin-left: auto;
  color: #89919d;
  font-size: 0.78rem;
}
.desk-alarm-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.desk-alarm {
  display: flex;
  flex-direction: column;
  min-height: 9.5rem;
  padding: 1.2rem 1.35rem;
  border: 1px solid #e1e5ec;
  border-radius: 1rem;
  text-align: left;
  background: #fff;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.desk-alarm:hover,
.desk-alarm-active {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px #1b315113;
}
.desk-alarm-overdue {
  background: #fff9f6;
  border-color: #f5ded5;
}
.desk-alarm-blocked {
  background: #f7f7fd;
  border-color: #e3e2f5;
}
.desk-alarm-due_today {
  background: #f7fbf8;
  border-color: #dfeee3;
}
.desk-alarm-top {
  display: flex;
  justify-content: space-between;
  color: #5f6877;
  font-size: 0.77rem;
  font-weight: 700;
}
.desk-alarm strong {
  margin-top: 0.8rem;
  font: 600 2.25rem/1 'Manrope';
  letter-spacing: -0.06em;
}
.desk-alarm-overdue strong {
  color: #d97455;
}
.desk-alarm-blocked strong {
  color: #7068b9;
}
.desk-alarm-due_today strong {
  color: #4b9a70;
}
.desk-alarm small {
  margin-top: 0.35rem;
  color: #85909b;
  font-size: 0.72rem;
}
.desk-workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(16rem, 0.75fr);
  gap: 1.35rem;
}
.desk-panel,
.desk-side-panel {
  border: 1px solid #e3e7ed;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 10px 35px #34415a08;
}
.desk-main-panel {
  min-height: 29rem;
}
.desk-panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.55rem 1.6rem 1.1rem;
}
.desk-panel-heading h2,
.desk-side-panel h2 {
  margin: 0;
  font: 600 1.28rem 'Manrope';
  letter-spacing: -0.035em;
}
.desk-section-kicker {
  margin-bottom: 0.42rem;
}
.desk-count {
  padding: 0.35rem 0.6rem;
  border-radius: 2rem;
  color: #536899;
  background: #edf2ff;
  font-size: 0.72rem;
  font-weight: 700;
}
.desk-tabs {
  display: flex;
  gap: 1.2rem;
  overflow-x: auto;
  padding: 0 1.6rem;
  border-bottom: 1px solid #edf0f4;
}
.desk-tabs button {
  flex: none;
  padding: 0.75rem 0;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #89909b;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.desk-tabs button.active {
  border-bottom-color: #315bea;
  color: #315bea;
}
.desk-tabs span {
  margin-left: 0.18rem;
  color: #9ba5b5;
}
.desk-task-row {
  display: grid;
  grid-template-columns: 0.5rem minmax(0, 1fr) 6.5rem 1.3rem;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.1rem 1.6rem;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  background: #fff;
  cursor: pointer;
}
.desk-task-row:hover {
  background: #f8faff;
}
.desk-task-mark {
  width: 0.43rem;
  height: 2.8rem;
  border-radius: 1rem;
  background: #aeb9ca;
}
.desk-priority-high {
  background: #e88360;
}
.desk-priority-medium {
  background: #e5b556;
}
.desk-priority-low {
  background: #81b8a1;
}
.desk-task-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.25rem;
}
.desk-task-main small {
  color: #8490a0;
  font-size: 0.69rem;
  font-weight: 700;
}
.desk-task-main small span {
  margin: 0 0.25rem;
}
.desk-task-main strong {
  overflow: hidden;
  font-size: 0.89rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.desk-task-main > span {
  color: #8993a0;
  font-size: 0.72rem;
}
.desk-task-due {
  color: #778293;
  font-size: 0.73rem;
}
.desk-task-arrow {
  color: #9aabc7;
}
.desk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4.3rem 1rem;
  text-align: center;
}
.desk-empty > span {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 1rem;
  color: #315bea;
  background: #edf2ff;
  font-size: 1.5rem;
}
.desk-empty strong {
  margin-top: 1rem;
}
.desk-empty p {
  max-width: 22rem;
  color: #8993a0;
  font-size: 0.82rem;
  line-height: 1.5;
}
.desk-side {
  display: grid;
  align-content: start;
  gap: 1.2rem;
}
.desk-side-panel {
  padding: 1.5rem;
}
.desk-side-panel h2 {
  margin-bottom: 1.2rem;
}
.desk-side-panel button {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.9rem 0;
  border: 0;
  border-bottom: 1px solid #edf0f4;
  text-align: left;
  background: transparent;
  cursor: pointer;
}
.desk-side-panel button span {
  color: #626e7e;
  font-size: 0.79rem;
}
.desk-side-panel button strong {
  color: #3458bb;
  font-size: 0.82rem;
}
.desk-guide {
  padding: 1.5rem;
  border-radius: 1rem;
  color: white;
  background: linear-gradient(145deg, #192d57, #263e7d 65%, #315bea);
}
.desk-guide > span {
  color: #b8c9f3;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.desk-guide h3 {
  margin: 1.5rem 0 0.7rem;
  font: 500 1.75rem/1.1 'Manrope';
  letter-spacing: -0.055em;
}
.desk-guide p {
  max-width: 15rem;
  color: #cbd6ef;
  font-size: 0.78rem;
  line-height: 1.55;
}
.desk-guide a {
  display: inline-block;
  margin-top: 1rem;
  color: #d7f0a2;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
}
.desk-overlay {
  position: fixed;
  z-index: 60;
  inset: 0;
  display: flex;
  justify-content: end;
  background: #10182778;
  backdrop-filter: blur(4px);
}
.desk-drawer {
  width: min(100%, 30rem);
  height: 100%;
  overflow-y: auto;
  padding: 1.6rem 1.8rem 3rem;
  background: #fff;
  box-shadow: -25px 0 70px #10182725;
}
.desk-drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #5670a7;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}
.desk-drawer-head button {
  border: 0;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
}
.desk-drawer h2 {
  margin: 0.9rem 0;
  font: 600 2.1rem/1.15 'Manrope';
  letter-spacing: -0.055em;
}
.desk-drawer h3 {
  margin: 1.6rem 0 0.8rem;
  font: 700 0.9rem 'Manrope';
}
.desk-detail-project {
  margin: 2rem 0 0.3rem;
  color: #5471b5;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}
.desk-detail-description {
  color: #717b89;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
}
.desk-detail-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-block: 1px solid #e5e9ef;
  color: #5570a4;
  font-size: 0.76rem;
  font-weight: 700;
}
.desk-person {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.75rem 0;
  font-size: 0.82rem;
  font-weight: 700;
}
.desk-end-link {
  margin-left: auto;
  border: 0;
  color: #b24538;
  background: transparent;
  font-size: 0.71rem;
  font-weight: 700;
  cursor: pointer;
}
.desk-participant-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  margin-top: 1rem;
}
.desk-participant-form label {
  grid-column: 1/-1;
  color: #536072;
  font-size: 0.75rem;
  font-weight: 700;
}
.desk-participant-form select {
  min-width: 0;
  padding: 0.5rem;
  border: 1px solid #dbe1eb;
  border-radius: 0.55rem;
  background: white;
  font-size: 0.75rem;
}
@media (max-width: 620px) {
  .desk-participant-form {
    grid-template-columns: 1fr 1fr;
  }
  .desk-participant-form button {
    grid-column: 1/-1;
  }
}
.desk-person small {
  display: block;
  margin-top: 0.1rem;
  color: #8a96a4;
  font-size: 0.69rem;
  font-weight: 500;
}
.desk-avatar {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border-radius: 50%;
  color: #315bea;
  background: #e8efff;
  font-size: 0.67rem;
}
.desk-history {
  padding: 0.65rem 0.8rem;
  border-left: 2px solid #b5c8f1;
  background: #f8faff;
  color: #5d6a7e;
  font-size: 0.78rem;
  line-height: 1.5;
}
.desk-history a {
  display: block;
  margin-top: 0.4rem;
  color: #315bea;
  font-weight: 700;
  text-decoration: none;
}
.desk-criteria {
  margin-top: 1.4rem;
}
.desk-checklist {
  margin-top: 1.4rem;
}
.desk-check-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0;
  color: #42516b;
  font-size: 0.79rem;
}
.desk-check-item input {
  accent-color: #315bea;
}
.desk-check-item .done {
  text-decoration: line-through;
  color: #9aa4b1;
}
.desk-check-add {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.65rem;
}
.desk-check-add input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.7rem;
  border: 1px solid #dbe1eb;
  border-radius: 0.55rem;
  background: white;
  font-size: 0.77rem;
}
.desk-check-add button {
  padding: 0.5rem 0.7rem;
  border: 0;
  border-radius: 0.55rem;
  color: #315bea;
  background: #eaf0ff;
  font-weight: 700;
  cursor: pointer;
}
.desk-criterion {
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e9ef;
}
.desk-criterion p {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  line-height: 1.5;
}
.desk-criterion small {
  display: block;
  color: #b26338;
  font-size: 0.68rem;
}
.desk-criterion label {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.6rem;
  color: #536072;
  font-size: 0.72rem;
  font-weight: 700;
}
.desk-criterion input[type='url'],
.desk-action-area input[type='url'] {
  width: 100%;
  min-height: 2.7rem;
  padding: 0.6rem 0.7rem;
  border: 1px solid #dbe1eb;
  border-radius: 0.55rem;
  background: #fff;
}
.desk-criterion .desk-criterion-check,
.desk-form .desk-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.desk-criterion-check input,
.desk-checkbox input {
  width: auto;
  min-height: auto;
  accent-color: #315bea;
}
.desk-action-area {
  display: grid;
  gap: 0.7rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e9ef;
}
.desk-action-area label,
.desk-form label {
  display: grid;
  gap: 0.4rem;
  color: #536072;
  font-size: 0.75rem;
  font-weight: 700;
}
.desk-action-area textarea,
.desk-action-area select,
.desk-form input,
.desk-form textarea,
.desk-form select {
  width: 100%;
  min-height: 2.8rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #dbe1eb;
  border-radius: 0.55rem;
  color: #1b2131;
  background: #fff;
  resize: vertical;
}
.desk-action-area textarea:focus,
.desk-action-area select:focus,
.desk-form input:focus,
.desk-form textarea:focus,
.desk-form select:focus {
  outline: 2px solid #a8bbf7;
  outline-offset: 1px;
}
.desk-action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
.desk-form {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}
.desk-form h3 {
  margin: 0;
}
.desk-form-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}
.desk-setup-second {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e9ef;
}
.desk-setup-note {
  margin-top: 1.5rem;
  color: #8793a3;
  font-size: 0.73rem;
  line-height: 1.5;
}
@media (max-width: 900px) {
  .desk-heading {
    align-items: start;
    flex-direction: column;
  }
  .desk-workspace-grid {
    grid-template-columns: 1fr;
  }
  .desk-side {
    grid-template-columns: 1fr 1fr;
  }
  .desk-alarm-grid {
    gap: 0.6rem;
  }
}
@media (max-width: 620px) {
  .desk-heading-actions {
    width: 100%;
  }
  .desk-intro-date {
    display: none;
  }
  .desk-alarm-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .desk-alarm {
    min-width: 10.5rem;
    scroll-snap-align: start;
  }
  .desk-side {
    grid-template-columns: 1fr;
  }
  .desk-task-row {
    grid-template-columns: 0.4rem minmax(0, 1fr) 1.1rem;
  }
  .desk-task-due {
    display: none;
  }
  .desk-panel-heading,
  .desk-task-row {
    padding-inline: 1rem;
  }
  .desk-tabs {
    padding-inline: 1rem;
  }
  .desk-drawer {
    padding-inline: 1.2rem;
  }
  .desk-form-pair {
    grid-template-columns: 1fr;
  }
}
.desk-page,
.desk-main-panel,
.desk-side {
  min-width: 0;
}
@media (max-width: 900px) {
  .desk-workspace-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 620px) {
  .desk-main-panel {
    min-height: 0;
  }
}
</style>
