<script>
import { VDateInput } from 'vuetify/labs/VDateInput'
import dayjs from 'dayjs'

export default {
  name: 'App',
  components: { VDateInput },
  data: () => ({
    theme: 'dark',
    drawer: true,
    rail: false,
    windowWidth: window.innerWidth,
    selectedFilter: 'All',
    selectedTag: 'All',
    addDialog: false,
    editDialog: false,
    addTagDialog: false,
    notes: [],
    tagItems: [],
    noteTitle: "",
    noteTitleRules: [v => (v && v.trim()) ? true : 'Title is required'],
    noteContent: "",
    noteTags: [],
    noteDueDate: null,
    noteCompleted: false,
    tagInput: "",
    tagInputRules: [v => (v && v.trim()) ? true : 'Tag is required'],
    currentNoteIndex: null,
    deleteDialog: false,
    noteToDelete: null,
  }),
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
  },
  computed: {
    filteredNotes() {
      return this.notes.filter((note) => {
        const matchesTag = this.selectedTag === 'All' || note.tags.includes(this.selectedTag)

        const matchesStatus =
          this.selectedFilter === 'All' ||
          (this.selectedFilter === 'Completed' && note.completed) ||
          (this.selectedFilter === 'Not Completed' && !note.completed)

        return matchesTag && matchesStatus
      })
    }
  },
  created() {
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || []
    const sortedNotes = storedNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    this.notes = sortedNotes

    this.tagItems = JSON.parse(localStorage.getItem('tagItems')) || []
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.rail = this.windowWidth < 850
      if (this.windowWidth <= 550) {
        this.drawer = false
        this.rail = false
      } else {
        this.drawer = true
        this.rail = true
      }
    },
    onTheme () {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
    },
    applyFilter(value, type) {
      if (type === 'completed') {
        this.selectedFilter = value
      } else if (type === 'tag') {
        this.selectedTag = value
      }
    },
    async validate () {
      const { valid } = await this.$refs.form.validate()

      if (valid) {
        const values = {
          title: this.noteTitle,
          content: this.noteContent,
          tags: this.noteTags,
          dueDate: this.noteDueDate,
          completed: this.noteCompleted,
          createdAt: new Date().getTime(),
          modifiedAt: new Date().getTime()
        }

        this.notes.unshift(values)
        localStorage.setItem('notes', JSON.stringify(this.notes))
        console.log(values)

        this.$refs.form.reset()
        this.noteDueDate = null
        this.addDialog = false
      }
    },
    reset () {
      this.$refs.form.reset()
      this.noteDueDate = null
      this.addDialog = false
    },
    formatDate(date) {
      return dayjs(date).format('MMMM D, YYYY')
    },
    formatDateTime(date) {
      return dayjs(date).format('MMMM D, YYYY hh:mm:ss A')
    },
    editNote(item, index) {
      this.noteTitle = item.raw.title
      this.noteContent = item.raw.content
      this.noteTags = item.raw.tags
      this.noteDueDate = item.raw.dueDate ? dayjs(item.raw.dueDate).toDate() : null
      this.noteCompleted = item.raw.completed
      this.currentNoteIndex = index
      this.editDialog = true
    },
    async saveNoteEdit() {
      const { valid } = await this.$refs.formEdit.validate()

      if (valid) {
        const updatedNote = {
          title: this.noteTitle,
          content: this.noteContent,
          tags: this.noteTags,
          dueDate: this.noteDueDate,
          completed: this.noteCompleted,
          createdAt: this.notes[this.currentNoteIndex].createdAt,
          modifiedAt: new Date().getTime()
        }

        this.notes[this.currentNoteIndex] = updatedNote
        localStorage.setItem('notes', JSON.stringify(this.notes))
        console.log(updatedNote)

        this.$refs.formEdit.reset()
        this.noteDueDate = null
        this.editDialog = false
      }
    },
    resetNoteEdit () {
      this.$refs.formEdit.reset()
      this.noteDueDate = null
      this.editDialog = false
    },
    confirmDelete(note) {
      this.noteToDelete = note
      this.deleteDialog = true
    },
    deleteNote() {
      if (this.noteToDelete !== null) {
        console.log(this.noteToDelete)
        const noteIndex = this.notes.findIndex(note => note.createdAt === this.noteToDelete.raw.createdAt)

        if (noteIndex !== -1) {
          this.notes.splice(noteIndex, 1)
          this.saveNotesToLocalStorage()
        }

        this.noteToDelete = null
        this.deleteDialog = false
      }
    },
    saveNotesToLocalStorage() {
      localStorage.setItem('notes', JSON.stringify(this.notes))
    },
    async saveAddTag() {
      const { valid } = await this.$refs.formTag.validate()

      if (valid) {
        const newTag = {
          text: this.tagInput,
          value: this.tagInput,
          icon: 'mdi-label-outline'
        }

        this.tagItems.push(newTag)
        localStorage.setItem('tagItems', JSON.stringify(this.tagItems))
        console.log(newTag, this.tagItems)

        this.$refs.formTag.reset()
        this.addTagDialog = false
      }
    },
    resetAddTag () {
      this.$refs.formTag.reset()
      this.addTagDialog = false
    },
  },
}
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-card>
        <v-layout>

          <v-app-bar
            scroll-behavior="elevate"
            prominent
            :color="theme === 'light' ? 'indigo-darken-3' : 'grey-darken-2'"
          >
            <template v-if="windowWidth > 550">
              <v-app-bar-nav-icon @click.stop="rail = !rail" />
            </template>
            <template v-else>
              <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            </template>
            <v-toolbar-title>To-Do App</v-toolbar-title>
            <v-spacer></v-spacer>
            <template v-if="windowWidth > 545">
              <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="tonal" prepend-icon="mdi-filter" class="mr-5">
                    {{ selectedFilter }}
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item title="All" @click="applyFilter('All', 'completed')" />
                  <v-list-item title="Completed" @click="applyFilter('Completed', 'completed')" />
                  <v-list-item title="Not Completed" @click="applyFilter('Not Completed', 'completed')" />
                </v-list>
              </v-menu>
              <v-btn
                @click="onTheme"
                :prepend-icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
                text="Toggle Theme"
                slim
                variant="outlined"
                class="mr-5"
              />
            </template>
            <template v-else>
              <v-menu open-on-hover>
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-filter" />
                </template>
                <v-list>
                  <v-list-item title="All" @click="applyFilter('All', 'completed')" />
                  <v-list-item title="Completed" @click="applyFilter('Completed', 'completed')" />
                  <v-list-item title="Not Completed" @click="applyFilter('Not Completed', 'completed')" />
                </v-list>
              </v-menu>
              <v-btn
                @click="onTheme"
                :icon="theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
                class="mr-2"
              />
            </template>
          </v-app-bar>

          <v-navigation-drawer
            v-model="drawer"
            :rail="rail"
            expand-on-hover
            :permanent="windowWidth > 550"
            :temporary="windowWidth <= 550"
            :width="windowWidth <= 550 ? 250 : windowWidth < 850 ? 200 : 250"
            class="h-screen overflow-auto"
          >
            <v-list nav>
              <v-dialog v-model="addDialog" max-width="600" persistent>
                <template v-slot:activator="{ props: activatorProps }">
                  <v-list-item prepend-icon="mdi-plus" title="Add Note" value="add" v-bind="activatorProps"></v-list-item>
                </template>
                <v-card prepend-icon="mdi-note-plus" title="New Note">
                  <v-form ref="form">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="noteTitle"
                            label="Title"
                            :rules="noteTitleRules"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="noteContent"
                            placeholder="Add your note..."
                          ></v-textarea>
                        </v-col>
                        <v-col :cols="12" :sm="6">
                          <v-select
                            v-model="noteTags"
                            label="Tags"
                            :items="tagItems"
                            item-title="text"
                            item-value="value"
                            multiple
                            chips
                            closable-chips
                          ></v-select>
                        </v-col>
                        <v-col :cols="12" :sm="6">
                          <v-date-input
                            v-model="noteDueDate"
                            label="Select due date"
                            prepend-icon=""
                            prepend-inner-icon="$calendar"
                          ></v-date-input>
                        </v-col>
                        <!-- <v-col :cols="12" :sm="4">
                          <v-checkbox
                            v-model="noteCompleted"
                            :label="`${noteCompleted ? 'Completed' : 'Not Completed'}`"
                          ></v-checkbox>
                        </v-col> -->
                      </v-row>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        text="Close"
                        variant="plain"
                        @click="reset"
                      />
                      <v-btn
                        color="primary"
                        text="Save"
                        variant="tonal"
                        @click="validate"
                      />
                    </v-card-actions>
                  </v-form>
                </v-card>
              </v-dialog>

              <v-list-item
                prepend-icon="mdi-note-multiple-outline"
                title="All Notes"
                value="notes"
                @click="applyFilter('All', 'tag')"
              />
              <v-list-subheader>Tags</v-list-subheader>
              <v-list-item prepend-icon="mdi-tag-plus" title="Add Tag" value="addTag" @click="addTagDialog = true"></v-list-item>
              <v-list-item
                v-for="(item, i) in tagItems"
                :key="i"
                @click="applyFilter(item.text, 'tag')"
                variant="plain"
              >
                <template v-slot:prepend>
                  <v-icon :icon="item.icon"></v-icon>
                </template>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>

          <v-main class="h-screen overflow-auto" style="background-color: lightgrey;">
            <v-data-iterator :items="filteredNotes" item-value="name" items-per-page="0" class="ma-10">
              <template v-slot:default="{ items }">
                <v-row>
                  <v-col v-for="(item, index) in items" :key="index" :cols="12" :sm="6" :md="4" :lg="3" :xl="2">
                    <v-card @click="editNote(item, index)">
                      <v-card-title class="d-flex align-center">
                        <h4 class="text-wrap">{{ item.raw.title }}</h4>
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" style="white-space: pre-line;">
                            {{ item.raw.content?.length > 200 ? item.raw.content.slice(0, 200) + '...' : item.raw.content }}
                          </v-col>
                          <v-col cols="12">
                            <v-chip v-for="(tag, i) in item.raw.tags" :key="i" :value="tag">
                              {{ tag }}
                            </v-chip>
                          </v-col>
                        </v-row>
                        <v-row justify="end">
                          <v-col cols="auto">
                            <v-chip v-if="item.raw.completed" label color="green" prepend-icon="mdi-check-circle">
                              Completed
                            </v-chip>
                            <v-chip v-else label prepend-icon="mdi-clock-outline">
                              Not Completed
                            </v-chip>
                          </v-col>
                        </v-row>
                        <v-divider class="my-2"></v-divider>
                        <p class="text-right text-caption mb-5">Due Date: {{ item.raw.dueDate ? formatDate(item.raw.dueDate) : "Not set" }}</p>
                        <!-- <p class="text-right text-caption">Created At: {{ formatDateTime(item.raw.createdAt) }}</p> -->
                        <!-- <p class="text-right text-caption">Modified At: {{ formatDateTime(item.raw.modifiedAt) }}</p> -->
                      </v-card-text>
                      <v-btn
                        @click.stop="confirmDelete(item)"
                        icon="mdi-delete"
                        color="red"
                        density="comfortable"
                        size="small"
                        class="position-absolute bottom-0 left-0 rounded"
                      />
                    </v-card>
                  </v-col>
                </v-row>
              </template>
            </v-data-iterator>
          </v-main>

          <v-dialog v-model="editDialog" max-width="600" persistent>
            <v-card prepend-icon="mdi-square-edit-outline" title="Edit Note">
              <v-form ref="formEdit">
                <v-card-text>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="noteTitle"
                        label="Title"
                        :rules="noteTitleRules"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="noteContent"
                        placeholder="Add your note..."
                      ></v-textarea>
                    </v-col>
                    <v-col :cols="12" :sm="6">
                      <v-select
                        v-model="noteTags"
                        label="Tags"
                        :items="tagItems"
                        item-title="text"
                        item-value="value"
                        multiple
                        chips
                        closable-chips
                      ></v-select>
                    </v-col>
                    <v-col :cols="12" :sm="6">
                      <v-date-input
                        v-model="noteDueDate"
                        label="Select due date"
                        prepend-icon=""
                        prepend-inner-icon="$calendar"
                      ></v-date-input>
                    </v-col>
                  </v-row>
                  <v-row justify="end">
                    <v-col :cols="12" :sm="4">
                      <v-checkbox
                        v-model="noteCompleted"
                        :label="`${noteCompleted ? 'Completed' : 'Not Completed'}`"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Close"
                    variant="plain"
                    @click="resetNoteEdit"
                  />
                  <v-btn
                    color="primary"
                    text="Save"
                    variant="tonal"
                    @click="saveNoteEdit"
                  />
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>

          <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
              <v-card-title class="text-h5">Confirm Delete</v-card-title>
              <v-card-text>
                Are you sure you want to delete this note?
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="grey" text @click="deleteDialog = false">Cancel</v-btn>
                <v-btn color="red" text @click="deleteNote">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="addTagDialog" max-width="250" persistent>
            <v-card prepend-icon="mdi-tag-plus-outline" title="Add Tag">
              <v-form ref="formTag">
                <v-card-text>
                  <v-text-field
                    v-model="tagInput"
                    label="Tag"
                    :rules="tagInputRules"
                    required
                  ></v-text-field>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    text="Close"
                    variant="plain"
                    @click="resetAddTag"
                  />
                  <v-btn
                    color="primary"
                    text="Add"
                    variant="tonal"
                    @click="saveAddTag"
                  />
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>

        </v-layout>
      </v-card>
    </v-app>
  </v-responsive>
</template>
